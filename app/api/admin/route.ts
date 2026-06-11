import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
    // get all admins
    try {
        const { data: admins, error: adminsGetError } = await supabase
            .rpc('get_coaches_with_ratings');

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