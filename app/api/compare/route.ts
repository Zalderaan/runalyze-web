import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * 
 * @param req 
 * @returns 
 */
export async function POST(req: NextRequest) {
    try {
        const { sessionA, sessionB } = await req.json();
        const { data: a, error: errorA } = await supabase
            .from("analysis_results")
            .select("*")
            .eq("id", sessionA)
            .single();

        const {data: b, error: errorB} = await supabase
        .from("analysis_results")
        .select("*")
        .eq("id", sessionB)
        .single();

        

    } catch (error) {
        return NextResponse.json(
            { data: "test" },
            { status: 201 }
        )
    }
}