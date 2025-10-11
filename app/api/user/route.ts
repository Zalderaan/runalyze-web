// filepath: c:\Users\godfr\Desktop\sideproj\run-analysis\runalyze\app\api\user\[id]\route.ts
import { NextResponse } from "next/server";
import { supabase } from '@/lib/supabase';

export async function GET() {
    // find all users
    const { data: users, error } = await supabase
        .from('users')
        .select('id, email, username, user_role')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ message: "Could not find user details according to ID", error: error.message }, { status: 404 });
    }

    if (!users) {
        return NextResponse.json({ message: "No users found" }, { status: 404 });
    }

    return NextResponse.json({ user: users }, { status: 200 }); // Return the user details
}