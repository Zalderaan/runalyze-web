import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Helper: Merge a drills row with its joined drill_template into a flat object
// that is backwards-compatible with the existing Drill interface.
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeDrillWithTemplate(drill: any) {
    const tpl = drill.drill_templates ?? {};
    return {
        ...drill,
        // Resolve display name from template (assignments don't carry their own drill_name after migration)
        drill_name: drill.drill_name ?? tpl.name ?? null,
        video_url: drill.video_url ?? tpl.video_url ?? null,
        // Override takes priority over template value, which takes priority over legacy column
        instructions: drill.instructions_override ?? tpl.instructions ?? drill.instructions ?? null,
        justification: drill.justification_override ?? tpl.justification ?? drill.justification ?? null,
        reference: drill.reference ?? tpl.reference ?? null,
        // Aggregate feedback lives on the template
        helpful_count: tpl.helpful_count ?? drill.helpful_count ?? 0,
        not_helpful_count: tpl.not_helpful_count ?? drill.not_helpful_count ?? 0,
        // Keep template metadata available for the UI
        template_id: drill.template_id ?? null,
        template_name: tpl.name ?? drill.drill_name ?? null,
        // Remove the nested drill_templates object to keep response flat
        drill_templates: undefined,
    };
}


export async function POST(req: NextRequest) {
    const formData = await req.formData();

    // --- Shared assignment-level fields ---
    const area = formData.get("area") as string;
    const performance_level = formData.get("performance_level") as string;
    const sets = formData.get("sets") ? Number(formData.get("sets")) : null;
    const reps = formData.get("reps") ? Number(formData.get("reps")) : null;
    const rep_type = formData.get("rep_type") as string | null;
    const frequency = formData.get("frequency") ? Number(formData.get("frequency")) : null;
    const difficulty_level = formData.get("difficulty_level") ? Number(formData.get("difficulty_level")) : 1;
    const is_high_impact = formData.get("is_high_impact") === "true";

    // --- Two-path discriminator ---
    const templateIdRaw = formData.get("template_id");
    const existingTemplateId = templateIdRaw ? Number(templateIdRaw) : null;

    if (existingTemplateId) {
        // ---------------------------------------------------------------
        // PATH A: Reuse an existing template — create assignment row only
        // ---------------------------------------------------------------
        const instructionsOverrideRaw = formData.get("instructions_override") as string | null;
        const instructions_override = instructionsOverrideRaw ? JSON.parse(instructionsOverrideRaw) : null;
        const justification_override = formData.get("justification_override") as string | null;

        try {
            const { data: newDrill, error: insertError } = await supabase
                .from('drills')
                .insert([{
                    template_id: existingTemplateId,
                    area,
                    performance_level,
                    sets,
                    reps,
                    rep_type,
                    frequency,
                    difficulty_level,
                    is_high_impact,
                    instructions_override: instructions_override ?? undefined,
                    justification_override: justification_override ?? undefined,
                }])
                .select()
                .single();

            if (insertError) {
                return NextResponse.json(
                    { message: "Database insert error (assignment)", details: insertError.message },
                    { status: 500 }
                );
            }
            return NextResponse.json(
                { message: "Drill assignment created successfully", drillId: newDrill.id },
                { status: 200 }
            );
        } catch (error) {
            console.error("Error creating drill assignment:", error);
            return NextResponse.json({ message: "Server error creating drill assignment" }, { status: 500 });
        }
    } else {
        // ---------------------------------------------------------------
        // PATH B: New drill — create template first, then assignment
        // ---------------------------------------------------------------
        const drill_name = formData.get("drill_name") as string;
        const instructionsRaw = formData.get("instructions") as string | null;
        const instructions = instructionsRaw ? JSON.parse(instructionsRaw) : null;
        const justification = formData.get("justification") as string | null;
        const reference = formData.get("reference") as string | null;
        const videoFile = formData.get("video") as File | null;

        let video_url: string | null = null;

        // Upload video to Supabase Storage
        if (videoFile) {
            const uuid = crypto.randomUUID();
            const filePath = `drill-videos/${uuid}-${videoFile.name}`;
            const { error: storageError } = await supabase.storage
                .from("videos")
                .upload(filePath, videoFile, { cacheControl: "3600", upsert: false });

            if (storageError) {
                return NextResponse.json(
                    { message: "Video upload error", error: storageError.message },
                    { status: 500 }
                );
            }
            video_url = supabase.storage.from("videos").getPublicUrl(filePath).data.publicUrl;
        }

        try {
            // 1. Insert into drill_templates
            const { data: newTemplate, error: templateError } = await supabase
                .from('drill_templates')
                .insert([{ name: drill_name, video_url, instructions, justification, reference }])
                .select()
                .single();

            if (templateError) {
                return NextResponse.json(
                    { message: "Database error creating drill template", details: templateError.message },
                    { status: 500 }
                );
            }

            // 2. Insert into drills (assignment) referencing the new template
            const { data: newDrill, error: drillError } = await supabase
                .from('drills')
                .insert([{
                    template_id: newTemplate.id,
                    drill_name,       // kept for backwards compat with old rows / Python backend
                    area,
                    performance_level,
                    sets,
                    reps,
                    rep_type,
                    frequency,
                    difficulty_level,
                    is_high_impact,
                    video_url,        // kept for backwards compat
                    instructions,     // kept for backwards compat
                    justification,    // kept for backwards compat
                    reference,        // kept for backwards compat
                }])
                .select()
                .single();

            if (drillError) {
                return NextResponse.json(
                    { message: "Database error creating drill assignment", details: drillError.message },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { message: "Drill created successfully", drillId: newDrill.id, templateId: newTemplate.id },
                { status: 200 }
            );
        } catch (error) {
            console.error("Error creating drill:", error);
            return NextResponse.json({ message: "Server error creating drill" }, { status: 500 });
        }
    }
}


export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const area = searchParams.get('area') || '';
        const performanceLevel = searchParams.get('performance_level') || '';
        const offset = (page - 1) * limit;

        let query = supabase
            .from('drills')
            .select(
                `id, drill_name, area, performance_level, video_url, sets, reps, rep_type, frequency,
                 instructions, justification, reference, helpful_count, not_helpful_count,
                 template_id, instructions_override, justification_override,
                 difficulty_level, is_high_impact, created_at, updated_at,
                 drill_templates(name, video_url, instructions, justification, reference, helpful_count, not_helpful_count)`,
                { count: 'exact' }
            );

        if (search) {
            // Search both the legacy drill_name column and (via text cast) the template name
            query = query.ilike('drill_name', `%${search}%`);
        }

        if (area && area !== 'All') {
            query = query.eq('area', area);
        }

        if (performanceLevel && performanceLevel !== 'All') {
            query = query.eq('performance_level', performanceLevel);
        }

        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error("Error getting drills:", error);
            return NextResponse.json(
                { message: "Error fetching drills", error: error.message },
                { status: 500 }
            );
        }

        const drills = (data ?? []).map(mergeDrillWithTemplate);

        return NextResponse.json(
            {
                drills,
                pagination: {
                    total: count ?? 0,
                    page,
                    limit,
                    totalPages: Math.ceil((count ?? 0) / limit),
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error getting drills:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
