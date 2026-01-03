import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
    // get all admins
    try {
        const { data: admins, error: adminsGetError } = await supabase
            .from('users')
            .select('id, email, username, user_role, is_active')
            .eq('user_role', 'admin')
            .order('created_at', { ascending: false });

        if (adminsGetError) {
            throw adminsGetError;
        }

        // console.log("this is admins: ", admins);

        return NextResponse.json(
            { data: admins },
            { status: 200 }
        )

    } catch (error) {
        console.error("Error getting all admins: ", error);
        return NextResponse.json(
            { message: `Server error encountered while getting all admins: `, error },
            { status: 500 }
        )
    }
}