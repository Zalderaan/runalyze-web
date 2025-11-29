import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth/session';

export async function GET() {
    try {
        // Get user id
        const cookieStore = await cookies();
        const cookie = cookieStore.get("session")?.value;
        if (!cookie) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }
        
        const session = await decrypt(cookie);
        if (!session?.userId) {
            return NextResponse.json(
                { message: "Invalid session" },
                { status: 401 }
            );
        }

        const { data: applicant_status, error: getStatusError } = await supabase
            .from("admin_applications")
            .select("status")
            .eq("user_id", session.userId)
            .single(); // Use .single() to get one record or error

        if (getStatusError) {
            if (getStatusError.code === 'PGRST116') {
                return NextResponse.json(
                    { error: "No admin application found for this user" },
                    { status: 404 }
                );
            }
            
            console.error("Database error:", getStatusError);
            return NextResponse.json(
                { error: "Failed to fetch application status" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { data: applicant_status },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error getting admin applicant's status:", error);
        return NextResponse.json(
            { error: "Server error encountered" },
            { status: 500 }
        );
    }
}