import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth/session';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // get user id
        const paramsObj = await params;
        const analysisID = paramsObj.id;
        const cookieStore = await cookies();
        const cookie = cookieStore.get("session")?.value;
        if (!cookie) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }
        const session = await decrypt(cookie);
        const userID = session?.userId;
        // console.log(userID)
        // console.log(analysisID)

        // query db
        const { data, error } = await supabase
            .from('analysis_results')
            .select(`
                    *,
                    videos(*),
                    feedbacks(*)
                `)
            .eq('id', analysisID)
            .eq('user_id', userID)
            .single();

        if (error) {
            console.error("Error fetching analysis: ", error);
            return NextResponse.json(
                { message: "Analysis not found or you don't have permission to access" },
                { status: 404 }
            );
        };
        const rawDetailedFeedback = data.feedbacks?.[0]?.detailed_feedback ?? {};
        const { _bmi_category, ...detailed_feedback } = rawDetailedFeedback;

        // Hydrate drills with latest metadata (video/thumbnail) from DB/templates
        const allDrillIds: number[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.values(detailed_feedback).forEach((area: any) => {
            if (area.drills && Array.isArray(area.drills)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                area.drills.forEach((d: any) => {
                    if (d.id) allDrillIds.push(d.id);
                });
            }
        });

        if (allDrillIds.length > 0) {
            // console.log("Hydrating drills:", allDrillIds);
            const { data: latestDrills, error: drillError } = await supabase
                .from('drills')
                .select('id, video_url, thumbnail_url, instructions, instructions_override, drill_templates(video_url, thumbnail_url, instructions)')
                .in('id', allDrillIds);

            if (drillError) {
                console.error("Error fetching latest drills for hydration:", drillError);
            }

            if (latestDrills) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const drillMap = new Map(latestDrills.map((d: any) => {
                    // Handle case where drill_templates might be an array or object
                    const tplRaw = d.drill_templates;
                    const tpl = Array.isArray(tplRaw) ? tplRaw[0] : (tplRaw ?? {});
                    
                    const resolvedVideo = tpl.video_url || d.video_url || null;
                    const resolvedThumb = tpl.thumbnail_url || d.thumbnail_url || null;
                    
                    const hasOverrideSteps = d.instructions_override &&
                        Array.isArray(d.instructions_override.steps) &&
                        d.instructions_override.steps.length > 0;
                        
                    const resolvedInstructions = hasOverrideSteps ? d.instructions_override : (tpl.instructions || d.instructions || null);
                    
                    // console.log(`Drill ${d.id} resolved video:`, resolvedVideo);
                    
                    return [d.id, {
                        video_url: resolvedVideo,
                        thumbnail_url: resolvedThumb,
                        instructions: resolvedInstructions
                    }];
                }));

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                Object.values(detailed_feedback).forEach((area: any) => {
                    if (area.drills && Array.isArray(area.drills)) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        area.drills.forEach((d: any) => {
                            const latest = drillMap.get(d.id);
                            if (latest) {
                                d.video_url = latest.video_url;
                                d.thumbnail_url = latest.thumbnail_url;
                                if (latest.instructions) {
                                    d.instructions = latest.instructions;
                                }
                            }
                        });
                    }
                });
            }
        }

        const flattenedData = {
            ...data,
            video_url: data.videos?.[0]?.video_url,
            thumbnail_url: data.videos?.[0]?.thumbnail_url,
            detailed_feedback,
            overall_assessment: data.feedbacks?.[0]?.overall_assessment,
            bmi_category: _bmi_category ?? "normal",
        };

        return NextResponse.json({ analysis: flattenedData }, { status: 200 });
    } catch (error) {
        console.error("Error getting user history details: ", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const paramsObj = await params;
        const analysisID = paramsObj.id;

        const body = await req.json();
        const { name, fatigue_level } = body;

        const cookieStore = await cookies();
        const cookie = cookieStore.get("session")?.value;
        if (!cookie) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

        const session = await decrypt(cookie);
        const userID = session?.userId;

        if (name === undefined && fatigue_level === undefined) {
             return NextResponse.json(
                { message: "No update parameters provided" },
                { status: 400 }
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (fatigue_level !== undefined) updates.fatigue_level = fatigue_level;

        const { error: updateError } = await supabase
            .from('analysis_results')
            .update(updates)
            .eq('id', analysisID)
            .eq('user_id', userID);

        if (updateError) {
            console.error("Error updating analysis name: ", updateError);
            return NextResponse.json(
                { message: "Failed to update analysis" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Analysis updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating analysis: ", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const paramsObj = await params;
        const analysisID = paramsObj.id;

        const cookieStore = await cookies();
        const cookie = cookieStore.get("session")?.value;
        if (!cookie) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

        const session = await decrypt(cookie);
        const userID = session?.userId;

        // First fetch associated videos to delete their storage objects using the Storage API
        const { data: analysisData } = await supabase
            .from('analysis_results')
            .select('videos(id, video_url, thumbnail_url)')
            .eq('id', analysisID)
            .eq('user_id', userID)
            .single();

        if (analysisData && analysisData.videos) {
            const filesToRemove: string[] = [];
            const videosList = Array.isArray(analysisData.videos) ? analysisData.videos : [analysisData.videos];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            videosList.forEach((vid: any) => {
                if (vid.video_url) {
                    const videoPath = vid.video_url.split('/object/public/videos/')[1]?.split('?')[0];
                    if (videoPath) filesToRemove.push(videoPath);
                }
                if (vid.thumbnail_url) {
                    const thumbPath = vid.thumbnail_url.split('/object/public/videos/')[1]?.split('?')[0];
                    if (thumbPath) filesToRemove.push(thumbPath);
                }
            });

            if (filesToRemove.length > 0) {
                // Delete actual files from bucket
                const { error: storageError } = await supabase.storage
                    .from('videos')
                    .remove(filesToRemove);
                
                if (storageError) {
                    console.error("Storage API deletion error:", storageError);
                } else {
                    console.log("Successfully removed files from storage:", filesToRemove);
                }

                // IMPORTANT: We must also manually delete the related video records BEFORE deleting analysis_results.
                // Otherwise, the cascading delete hits the database storage.objects trigger and causes 42501 error.
                // Since there is a trigger on `videos` interacting with storage.objects, we need to explicitly delete `videos` individually? 
                // Wait! If the storage API successfully removes the objects, S3 might already cascade delete the video records if the foreign key is set up with ON DELETE CASCADE. 
                // Just in case the cascade doesn't happen automatically (if FKs are not set), we delete the videos explicitly.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const videoIds = videosList.map((v: any) => v.id).filter(Boolean);
                if (videoIds.length > 0) {
                    await supabase.from('videos').delete().in('id', videoIds);
                }
            }
        }

        // Delete analysis record (should cascade to feedback if set up properly)
        const { error: deleteError } = await supabase
            .from('analysis_results')
            .delete()
            .eq('id', analysisID)
            .eq('user_id', userID);

        if (deleteError) {
            console.error("Error deleting analysis: ", deleteError);
            return NextResponse.json(
                { message: "Failed to delete analysis" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Analysis and related data deleted successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error deleting analysis: ", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}