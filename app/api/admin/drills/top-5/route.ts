import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET top 5 drills by helpful_count
export async function GET() {
    try {
        const { data: topDrills, error: topDrillsError } = await supabase
            .from("drills")
            .select("id, drill_name, area, performance_level, helpful_count, not_helpful_count")
            .order("helpful_count", { ascending: false })
            .limit(5);

        if (topDrillsError) {
            console.error("Supabase error:", topDrillsError);
            return NextResponse.json(
                { error: "Failed to fetch top drills" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { data: topDrills },
            { status: 200 }
        );
    } catch (error) {
        console.error("Encountered error while getting top 5 drills", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}