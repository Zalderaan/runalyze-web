// filepath: c:\Users\godfr\Desktop\sideproj\run-analysis\runalyze\app\api\user\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from '@/lib/supabase';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
        const paramsObj = await params;
        const uid = paramsObj.id;

    // find user details by user ID
    const { data: user_details, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

    if (error) {
        return NextResponse.json({ message: "Could not find user details according to ID", error: error.message }, { status: 404 });
    }

    if (!user_details) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: user_details }, { status: 200 }); // Return the user details
}