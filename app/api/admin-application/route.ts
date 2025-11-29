import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

//* GET ALL APPLICANTS
export async function GET() {
    // get all admins
    try {
        const { data: applicants, error: applicantsGetError } = await supabase
            .from('users')
            .select(`
                id, 
                email, 
                username,
                admin_applications (
                    application_id,
                    submitted_at,
                    status
                )
            `)
            .eq('user_role', 'admin_applicant')
            .order('created_at', { ascending: false });

        if (applicantsGetError) {
            throw applicantsGetError;
        }

        // console.log("this is applicants: ", applicants);

        return NextResponse.json(
            { data: applicants },
            { status: 200 }
        )

    } catch (error) {
        console.error("Error getting all applicants: ", error);
        return NextResponse.json(
            { message: `Server error encountered while getting all applicants: `, error },
            { status: 500 }
        )
    }
}