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
        const flattenedData = {
            ...data,
            video_url: data.videos?.[0]?.video_url,
            thumbnail_url: data.videos?.[0]?.thumbnail_url,
            detailed_feedback: data.feedbacks?.[0]?.detailed_feedback,
            overall_assessment: data.feedbacks?.[0]?.overall_assessment,
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