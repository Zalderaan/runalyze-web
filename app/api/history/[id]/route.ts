import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
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
            console.log(userID)
    } catch ( error ) {
        console.error("Error getting user history details: ", error);
        return NextResponse.json(
            { message: "Server error" }, 
            { status: 500 }
        );
    }
}