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
        console.log(userID)
        console.log(analysisID)

        // query db
        const { data, error } = await supabase
            .from('analysis_results')
            .select(`
                    *,
                    video:video_id (
                        video_url,
                        thumbnail_url
                    ),
                    feedback:feedback_id (
                        overall_assessment,
                        detailed_feedback,
                        strengths,
                        priority_areas
                    )
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
        const flattenedData = {
            ...data,
            video_url: data.video?.video_url, // Extract video_url from the nested object
            thumbnail_url: data.video?.thumbnail_url,
            video_id: data.video_id ? data.video.id : data.video_id, // Keep the original video_id value if needed
            overall_assessment: data.feedback.overall_assessment,
            detailed_feedback: data.feedback.detailed_feedback,
            strengths: data.feedback.strengths,
            priority_areas: data.feedback.priority_areas
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

        // Get analysis with related data
        const { data: analysisData, error: fetchError } = await supabase
            .from('analysis_results')
            .select(`
                id, 
                user_id, 
                video_id, 
                feedback_id,
                video:video_id (
                    video_url,
                    thumbnail_url
                )
            `)
            .eq('id', analysisID)
            .eq('user_id', userID)
            .single();

        if (fetchError || !analysisData) {
            return NextResponse.json(
                { message: "Analysis not found" },
                { status: 404 }
            );
        }

        // Delete analysis record first (should cascade to feedback if set up properly)
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

        // Delete the video record from the videos table
        // This will trigger the delete-video-storage edge function via database trigger
        if (analysisData.video_id) {
            const { error: videoDeleteError } = await supabase
                .from('videos')
                .delete()
                .eq('id', analysisData.video_id);

            if (videoDeleteError) {
                console.error("Error deleting video record: ", videoDeleteError);
                // Note: Analysis is already deleted, but video cleanup failed
                return NextResponse.json(
                    { 
                        message: "Analysis deleted but video cleanup failed",
                        warning: "Video files may still exist in storage"
                    },
                    { status: 200 } // Still return success since main deletion worked
                );
            }
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