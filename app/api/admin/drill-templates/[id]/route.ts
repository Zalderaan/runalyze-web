import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const formData = await req.formData();

    const name = formData.get("name") as string | null;
    const instructionsRaw = formData.get("instructions") as string | null;
    const instructions = instructionsRaw ? JSON.parse(instructionsRaw) : null;
    const justification = formData.get("justification") as string | null;
    const reference = formData.get("reference") as string | null;
    const videoFile = formData.get("video") as File | null;
    const thumbnailFile = formData.get("thumbnail") as File | null;

    try {
        // Handle optional video upload
        let video_url: string | null = null;
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

        // Handle optional thumbnail upload
        let thumbnail_url: string | null = null;
        if (thumbnailFile) {
            const uuid = crypto.randomUUID();
            const filePath = `drill-thumbnails/${uuid}-${thumbnailFile.name}`;
            const { error: storageError } = await supabase.storage
                .from("videos")
                .upload(filePath, thumbnailFile, { cacheControl: "3600", upsert: false });

            if (!storageError) {
                thumbnail_url = supabase.storage.from("videos").getPublicUrl(filePath).data.publicUrl;
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const templateUpdate: Record<string, any> = { updated_at: new Date().toISOString() };
        if (name !== null) templateUpdate.name = name;
        if (instructions !== null) templateUpdate.instructions = instructions;
        if (justification !== null) templateUpdate.justification = justification;
        if (reference !== null) templateUpdate.reference = reference;
        if (video_url !== null) templateUpdate.video_url = video_url;
        if (thumbnail_url !== null) templateUpdate.thumbnail_url = thumbnail_url;

        const { data, error } = await supabase
            .from('drill_templates')
            .update(templateUpdate)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { message: "Error updating drill template", error: error.message },
                { status: 500 }
            );
        }

        // Cascade template changes to all linked drills (legacy compat columns).
        // Skip rows that have an active instructions_override so per-assignment
        // customisations are preserved.
        const drillCascade: Record<string, any> = {};
        if (name         !== null) drillCascade.drill_name    = name;
        if (instructions !== null) drillCascade.instructions  = instructions;
        if (justification !== null) drillCascade.justification = justification;
        if (reference    !== null) drillCascade.reference      = reference;
        if (video_url    !== null) drillCascade.video_url      = video_url;
        if (thumbnail_url !== null) drillCascade.thumbnail_url = thumbnail_url;

        if (Object.keys(drillCascade).length > 0) {
            const instructionFieldsChanged = instructions !== null || justification !== null;

            if (instructionFieldsChanged) {
                // Drills with NO instructions_override → cascade instructions + other fields
                await supabase
                    .from('drills')
                    .update(drillCascade)
                    .eq('template_id', id)
                    .is('instructions_override', null);

                // Drills WITH an instructions_override → cascade only non-instruction fields
                const nonInstructionCascade: Record<string, any> = {};
                if (name          !== null) nonInstructionCascade.drill_name    = name;
                if (reference     !== null) nonInstructionCascade.reference     = reference;
                if (video_url     !== null) nonInstructionCascade.video_url     = video_url;
                if (thumbnail_url !== null) nonInstructionCascade.thumbnail_url = thumbnail_url;

                if (Object.keys(nonInstructionCascade).length > 0) {
                    await supabase
                        .from('drills')
                        .update(nonInstructionCascade)
                        .eq('template_id', id)
                        .not('instructions_override', 'is', null);
                }
            } else {
                // No instruction fields changed — safe to cascade to all linked drills
                await supabase
                    .from('drills')
                    .update(drillCascade)
                    .eq('template_id', id);
            }
        }

        return NextResponse.json(
            { message: "Drill template updated successfully", template: data },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating drill template:", error);
        return NextResponse.json({ message: "Server error while updating drill template" }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const { data, error } = await supabase
            .from('drill_templates')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching drill template:', error);
            return NextResponse.json({ message: 'Error fetching drill template', error: error.message }, { status: 500 });
        }

        // Also fetch a sample drill linked to this template to provide training defaults
        const { data: sampleDrill, error: drillError } = await supabase
            .from('drills')
            .select('sets, reps, rep_type, frequency, is_high_impact')
            .eq('template_id', id)
            .limit(1)
            .single();

        if (drillError && drillError.code !== 'PGRST116') {
            console.error('Error fetching sample drill for template:', drillError);
        }

        return NextResponse.json({ template: data, sample_drill: sampleDrill ?? null }, { status: 200 });
    } catch (err) {
        console.error('Server error fetching drill template:', err);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
