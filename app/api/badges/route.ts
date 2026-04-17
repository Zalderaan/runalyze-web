import { NextRequest, NextResponse } from "next/server";
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get("session")?.value;
        if (!cookie) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }
        
        const session = await decrypt(cookie);
        const userID = session?.userId;

        const { data, error } = await supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', userID);

        if (error) {
            console.error("Error fetching badges: ", error);
            return NextResponse.json(
                { message: "Failed to fetch badges" },
                { status: 500 }
            );
        }

        return NextResponse.json({ badges: data }, { status: 200 });
    } catch (error) {
        console.error("Error getting badges: ", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { badge_id } = body;

        const cookieStore = await cookies();
        const cookie = cookieStore.get("session")?.value;
        if (!cookie) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }

        const session = await decrypt(cookie);
        const userID = session?.userId;

        if (!badge_id) {
            return NextResponse.json(
                { message: "Badge ID is required" },
                { status: 400 }
            );
        }

        // Upsert logic based on unique user_id + badge_id
        const { data, error } = await supabase
            .from('user_badges')
            .upsert({ user_id: userID, badge_id: badge_id }, { onConflict: 'user_id,badge_id' })
            .select()
            .single();

        if (error) {
            console.error("Error inserting badge: ", error);
            return NextResponse.json(
                { message: "Failed to award badge" },
                { status: 500 }
            );
        }

        return NextResponse.json({ badge: data, message: "Badge awarded successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error awarding badge: ", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
