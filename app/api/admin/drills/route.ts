import { NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth/session';

export async function GET() {
    try {
        const { data, error} = await supabase
            .from('drills')
            .select(`id, drill_name, area, performance_level, video_url`)

        if (error) {
            console.error("Error getting user history: ", error);
            return NextResponse.json(
                { message: "Error fetching drills", error: error.message},
                { status: 500 }
            );
        }
        
        const drills = data
        return NextResponse.json(
            { drills },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error getting drills: ", error);
        return NextResponse.json(
            { message: "Server error"},
            { status: 500 }
        )
    }
}