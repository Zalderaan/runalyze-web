import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET total drill count
export async function GET() {
    try {
        const { count, error } = await supabase
            .from("drills")
            .select("*", { count: "exact", head: true });

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json(
                { error: "Failed to fetch drill count" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { count: count ?? 0 },
            { status: 200 }
        );
    } catch (error) {
        console.error("Encountered error while getting drill count", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}