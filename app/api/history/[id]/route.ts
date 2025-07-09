import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth/session';

export async function GET(
    req: NextRequest, 
    { params } : { params: { id: string }}
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
                    video_id (
                        video_url
                    )
                `)
                .eq('id', analysisID)
                .eq('user_id', userID)
                .single();

            if (error) {
                console.error("Error fetching analysis: ", error);
                return NextResponse.json(
                    { message: "Analysis not found or you don't have permission to access"},
                    { status: 404}
                );
            };

            const flattenedData = {
                ...data,
                video_url: data.video_id?.video_url, // Extract video_url from the nested object
                video_id: data.video_id ? data.video_id.id : data.video_id // Keep the original video_id value if needed
            };

            return NextResponse.json({ analysis: flattenedData }, { status: 200 });
    } catch ( error ) {
        console.error("Error getting user history details: ", error);
        return NextResponse.json(
            { message: "Server error" }, 
            { status: 500 }
        );
    }
}