import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth/session';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
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
    { params }: { params: { id: string } }
) {
    try {
        const analysisID = (await params).id;

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

        // // Delete video files from storage (optional)
        // if (analysisData.video?.video_url) {
        //     // Extract file path from URL and delete from storage
        //     // This depends on your storage structure
        // }

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