import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

// ---------------------------------------------------------------------------
// Helper: Merge drills row with its joined drill_template
// ---------------------------------------------------------------------------
function mergeDrillWithTemplate(drill: any) {
    const tplRaw = drill.drill_templates;
    const tpl = Array.isArray(tplRaw) ? tplRaw[0] : (tplRaw ?? {});

    // Check if instructions_override has actual custom steps.
    // An empty steps array {"steps": []} is treated as no override.
    const hasOverrideSteps = drill.instructions_override &&
                             Array.isArray(drill.instructions_override.steps) &&
                             drill.instructions_override.steps.length > 0;

    return {
        ...drill,
        drill_name: tpl.name || drill.drill_name || null,
        video_url: tpl.video_url || drill.video_url || null,
        thumbnail_url: tpl.thumbnail_url || drill.thumbnail_url || null,
        instructions: hasOverrideSteps ? drill.instructions_override : (tpl.instructions || drill.instructions || null),
        justification: drill.justification_override || tpl.justification || drill.justification || null,
        reference: tpl.reference || drill.reference || null,
        helpful_count: tpl.helpful_count ?? drill.helpful_count ?? 0,
        not_helpful_count: tpl.not_helpful_count ?? drill.not_helpful_count ?? 0,
        template_id: drill.template_id ?? null,
        template_name: tpl.name || drill.drill_name || null,
        drill_templates: undefined,
    };
}

// ---------------------------------------------------------------------------
// GET /api/admin/drills/[id]
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const { data, error } = await supabase
            .from('drills')
            .select(`
                *,
                drill_templates(name, video_url, thumbnail_url, instructions, justification, reference, helpful_count, not_helpful_count)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error("Error getting drill details:", error);
            return NextResponse.json(
                { message: "Error fetching drill details", error: error.message },
                { status: 500 }
            );
        }
        if (!data) {
            return NextResponse.json({ message: "Drill not found" }, { status: 404 });
        }

        return NextResponse.json(
            { message: "Drill details found successfully", drill: mergeDrillWithTemplate(data) },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error getting drill details:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/drills/[id] — Helpful / not_helpful voting
// Votes are tracked on drill_templates (global, per-drill feedback)
// ---------------------------------------------------------------------------
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get("session")?.value;
        if (!cookie) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { action } = body; // 'helpful' or 'not_helpful'

        // Resolve the template_id for this drill assignment
        const { data: drillRow, error: drillFetchError } = await supabase
            .from('drills')
            .select('template_id, helpful_count, not_helpful_count')
            .eq('id', id)
            .single();

        if (drillFetchError || !drillRow) {
            return NextResponse.json({ message: "Drill not found" }, { status: 404 });
        }

        const columnToUpdate = action === 'helpful' ? 'helpful_count' : 'not_helpful_count';

        if (drillRow.template_id) {
            // Vote on the template (preferred path)
            const { data: template } = await supabase
                .from('drill_templates')
                .select('helpful_count, not_helpful_count')
                .eq('id', drillRow.template_id)
                .single();

            const { data, error } = await supabase
                .from('drill_templates')
                .update({ [columnToUpdate]: (template?.[columnToUpdate] || 0) + 1 })
                .eq('id', drillRow.template_id)
                .select()
                .single();

            if (error) {
                return NextResponse.json(
                    { message: "Error updating helpful count on template", error: error.message },
                    { status: 500 }
                );
            }
            return NextResponse.json({ data }, { status: 200 });
        } else {
            // Fallback: no template_id yet, vote on the drills row (legacy)
            const { data, error } = await supabase
                .from('drills')
                .update({ [columnToUpdate]: (drillRow?.[columnToUpdate] || 0) + 1 })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                return NextResponse.json(
                    { message: "Error updating helpful count", error: error.message },
                    { status: 500 }
                );
            }
            return NextResponse.json({ data }, { status: 200 });
        }
    } catch (error) {
        console.error("Error updating helpful count:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/drills/[id] — Update drill
//
// update_scope = 'template' (default):
//   Updates drill_templates (name, video_url, instructions, justification, reference).
//   Clears instructions_override and justification_override on this assignment
//   so it falls back to the fresh template values.
//
// update_scope = 'assignment':
//   Updates only this drills row (instructions_override, justification_override).
//   Template is left untouched.
//
// Assignment-level fields (area, performance_level, sets, reps, rep_type, frequency,
// difficulty_level, is_high_impact) always update the drills row regardless of scope.
// ---------------------------------------------------------------------------
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const formData = await req.formData();

    const update_scope = (formData.get("update_scope") as string | null) ?? 'template';

    // --- Assignment-level fields (always update drills row) ---
    const area = formData.get("area") as string | null;
    const performance_level = formData.get("performance_level") as string | null;
    const sets = formData.get("sets") as string | null;
    const reps = formData.get("reps") as string | null;
    const rep_type = formData.get("rep_type") as string | null;
    const frequency = formData.get("frequency") as string | null;
    const difficulty_level = formData.get("difficulty_level") ? Number(formData.get("difficulty_level")) : null;
    const is_high_impact_raw = formData.get("is_high_impact");
    const is_high_impact = is_high_impact_raw !== null ? is_high_impact_raw === "true" : null;
    
    const template_id_raw = formData.get("template_id");
    const template_id = template_id_raw ? Number(template_id_raw) : null;

    // --- Shared content fields ---
    const drill_name = formData.get("drill_name") as string | null;
    const instructionsRaw = formData.get("instructions") as string | null;
    const instructions = instructionsRaw ? JSON.parse(instructionsRaw) : null;
    const justification = formData.get("justification") as string | null;
    const reference = formData.get("reference") as string | null;
    const videoFile = formData.get("video") as File | null;

    // Fetch the current drill to get its template_id
    const { data: currentDrill, error: fetchError } = await supabase
        .from('drills')
        .select('template_id, drill_name, video_url')
        .eq('id', id)
        .single();

    if (fetchError || !currentDrill) {
        return NextResponse.json({ message: "Drill not found" }, { status: 404 });
    }

    // Build assignment-level update object (always applied)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignmentUpdate: Record<string, any> = {};
    if (area !== null) assignmentUpdate.area = area;
    if (performance_level !== null) assignmentUpdate.performance_level = performance_level;
    if (sets !== null) assignmentUpdate.sets = sets;
    if (reps !== null) assignmentUpdate.reps = reps;
    if (rep_type !== null) assignmentUpdate.rep_type = rep_type;
    if (frequency !== null) assignmentUpdate.frequency = frequency;
    if (difficulty_level !== null) assignmentUpdate.difficulty_level = difficulty_level;
    if (is_high_impact !== null) assignmentUpdate.is_high_impact = is_high_impact;
    if (template_id !== null) assignmentUpdate.template_id = template_id;

    try {
        if (update_scope === 'assignment') {
            // ---------------------------------------------------------------
            // SCOPE: assignment — write overrides onto drills row only
            // ---------------------------------------------------------------
            if (instructions !== null) assignmentUpdate.instructions_override = instructions;
            if (justification !== null) assignmentUpdate.justification_override = justification;
            // Keep legacy columns in sync for Python backend
            if (drill_name !== null) assignmentUpdate.drill_name = drill_name;

            const { data, error } = await supabase
                .from('drills')
                .update(assignmentUpdate)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                return NextResponse.json(
                    { message: "Error updating drill assignment", error: error.message },
                    { status: 500 }
                );
            }
            return NextResponse.json(
                { message: "Drill assignment updated successfully", drill: data },
                { status: 200 }
            );

        } else {
            // ---------------------------------------------------------------
            // SCOPE: template (default) — update the shared template,
            // then clear overrides on this assignment so it uses fresh values
            // ---------------------------------------------------------------

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

            if (currentDrill.template_id) {
                const isReassignment = template_id !== null && template_id !== currentDrill.template_id;

                if (!isReassignment) {
                    // Update the template
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const templateUpdate: Record<string, any> = { updated_at: new Date().toISOString() };
                    if (drill_name !== null) templateUpdate.name = drill_name;
                    if (instructions !== null) templateUpdate.instructions = instructions;
                    if (justification !== null) templateUpdate.justification = justification;
                    if (reference !== null) templateUpdate.reference = reference;
                    if (video_url !== null) templateUpdate.video_url = video_url;

                    const { error: templateError } = await supabase
                        .from('drill_templates')
                        .update(templateUpdate)
                        .eq('id', currentDrill.template_id);

                    if (templateError) {
                        return NextResponse.json(
                            { message: "Error updating drill template", error: templateError.message },
                            { status: 500 }
                        );
                    }

                    // Keep legacy columns in sync for Python backend
                    if (drill_name !== null) assignmentUpdate.drill_name = drill_name;
                    if (instructions !== null) assignmentUpdate.instructions = instructions;
                    if (justification !== null) assignmentUpdate.justification = justification;
                    if (reference !== null) assignmentUpdate.reference = reference;
                    if (video_url !== null) assignmentUpdate.video_url = video_url;
                    
                    // ── NEW: cascade to sibling drills that share this template ──────────────
                    const siblingCascade: Record<string, any> = {};
                    if (drill_name   !== null) siblingCascade.drill_name    = drill_name;
                    if (instructions !== null) siblingCascade.instructions  = instructions;
                    if (justification !== null) siblingCascade.justification = justification;
                    if (reference    !== null) siblingCascade.reference      = reference;
                    if (video_url    !== null) siblingCascade.video_url      = video_url;

                    if (Object.keys(siblingCascade).length > 0) {
                        const instructionsChanged = instructions !== null || justification !== null;

                        if (instructionsChanged) {
                            // Siblings with no override — cascade everything
                            await supabase
                                .from('drills')
                                .update(siblingCascade)
                                .eq('template_id', currentDrill.template_id)
                                .neq('id', id)
                                .is('instructions_override', null);

                            // Siblings WITH override — cascade only non-instruction fields
                            const nonInstrSibling: Record<string, any> = {};
                            if (drill_name !== null) nonInstrSibling.drill_name = drill_name;
                            if (reference  !== null) nonInstrSibling.reference  = reference;
                            if (video_url  !== null) nonInstrSibling.video_url  = video_url;

                            if (Object.keys(nonInstrSibling).length > 0) {
                                await supabase
                                    .from('drills')
                                    .update(nonInstrSibling)
                                    .eq('template_id', currentDrill.template_id)
                                    .neq('id', id)
                                    .not('instructions_override', 'is', null);
                            }
                        } else {
                            await supabase
                                .from('drills')
                                .update(siblingCascade)
                                .eq('template_id', currentDrill.template_id)
                                .neq('id', id);
                        }
                    }
                    // ────────────────────────────────────────────────────────────────────────
                } else {
                    // It's a reassignment. Fetch the new template to sync legacy columns.
                    const { data: newTemplate } = await supabase
                        .from('drill_templates')
                        .select('*')
                        .eq('id', template_id)
                        .single();
                        
                    if (newTemplate) {
                        assignmentUpdate.drill_name = newTemplate.name;
                        assignmentUpdate.instructions = newTemplate.instructions;
                        assignmentUpdate.justification = newTemplate.justification;
                        assignmentUpdate.reference = newTemplate.reference;
                        assignmentUpdate.video_url = newTemplate.video_url;
                    }
                }

                // Clear overrides so this assignment defers to the updated (or newly assigned) template
                assignmentUpdate.instructions_override = null;
                assignmentUpdate.justification_override = null;
            } else {
                // No template yet (legacy row) — just update the drills row directly
                if (drill_name !== null) assignmentUpdate.drill_name = drill_name;
                if (instructions !== null) assignmentUpdate.instructions = instructions;
                if (justification !== null) assignmentUpdate.justification = justification;
                if (reference !== null) assignmentUpdate.reference = reference;
                if (video_url !== null) assignmentUpdate.video_url = video_url;
            }

            const { data, error } = await supabase
                .from('drills')
                .update(assignmentUpdate)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                return NextResponse.json(
                    { message: "Error updating drill", error: error.message },
                    { status: 500 }
                );
            }
            if (!data) {
                return NextResponse.json({ message: "Drill not found" }, { status: 404 });
            }

            return NextResponse.json(
                { message: "Drill updated successfully", drill: data },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error("Error updating drill:", error);
        return NextResponse.json({ message: "Server error while updating drill" }, { status: 500 });
    }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/drills/[id]
// Deletes the assignment row only. Template is preserved.
// ---------------------------------------------------------------------------
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const { data, error } = await supabase
            .from("drills")
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (!data) {
            return NextResponse.json({ message: "Drill to delete not found" }, { status: 404 });
        }
        if (error) {
            return NextResponse.json(
                { message: "There was an error deleting a drill", error },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Drill deleted successfully", drill: data },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}
