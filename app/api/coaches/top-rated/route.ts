import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const { data: coach, error } = await supabase
            .rpc("get_top_rated_coach")
            .maybeSingle(); // We expect 0 or 1 row

        if (error) {
            throw error;
        }

        return NextResponse.json(
            { coach: coach || null },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error getting top rated coach: ", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { message: "Internal server error", error: errorMessage },
            { status: 500 }
        );
    }
}
