import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const { data, error } = await supabase
            .from("admin_applications")
            .select("status");

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json(
                { error: "Failed to fetch application counts" },
                { status: 500 }
            );
        }

        const counts = {
            total: data.length,
            pending: data.filter((app) => app.status === "for_review").length,
            approved: data.filter((app) => app.status === "approved").length,
            rejected: data.filter((app) => app.status === "rejected").length,
        };

        return NextResponse.json(counts, { status: 200 });
    } catch (error) {
        console.error("Error getting application counts:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}