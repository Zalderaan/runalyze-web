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