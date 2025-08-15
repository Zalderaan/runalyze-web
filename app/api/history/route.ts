import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth/session';

export async function GET(req: NextRequest){
    try {
        // get user id
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

        // query db
        const { data, error } = await supabase
            .from('analysis_results')
            .select(`
                *, 
                videos (
                    thumbnail_url
                )
            `)
            .eq('user_id', userID)
            .order('created_at', { ascending: false });
    
        if (error) {
            console.error("Error getting user history: ", error);
            return NextResponse.json(
                { message: "Error fetching history", error: error.message }, 
                { status: 500 }
            );
            
        }
        return NextResponse.json({ history: data }, { status: 200 });
    } catch (error) {
        console.error("Error getting user history: ", error);
        return NextResponse.json(
            { message: "Server error" }, 
            { status: 500 }
        );
    }
}