import { NextRequest, NextResponse } from "next/server";
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
    try {

    } catch (error) {
        console.error("Error getting user history: ", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}