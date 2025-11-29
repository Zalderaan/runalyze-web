import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/session";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get("session")?.value;
        if (!cookie) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const session = await decrypt(cookie);
        if (!session?.userId) {
            return NextResponse.json(
                { error: "Invalid session" },
                { status: 401 }
            );
        }

        const { data: application, error } = await supabase
            .from("admin_applications")
            .select("application_id, status, submitted_at")
            .eq("user_id", session.userId)
            .single();

        if (error && error.code === 'PGRST116') {
            return NextResponse.json({ application: null }, { status: 200 });
        }

        if (error) {
            return NextResponse.json(
                { error: "Failed to fetch application" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            application: {
                applicationId: application.application_id,
                status: application.status,
                submittedAt: application.submitted_at
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}