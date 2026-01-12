import { NextRequest, NextResponse } from "next/server";
import { supabase } from '@/lib/supabase';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const paramsObj = await params;
    
    if (!paramsObj || !paramsObj.id) {
        return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }
    
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

    return NextResponse.json({ user: user_details }, { status: 200 });
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const paramsObj = await params;
    
    if (!paramsObj || !paramsObj.id) {
        return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }
    
    const uid = paramsObj.id;

    const body = await req.json();
    console.log("Received body: ", body);
    const { height_cm, weight_kg, time_3k, time_5k, time_10k } = body;

    // Update user details
    const { data: updated_user, error } = await supabase
        .from('users')
        .update({
            height_cm,
            weight_kg,
            time_3k,
            time_5k,
            time_10k
        })
        .eq('id', uid)
        .select()
        .single();

    if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ message: "Failed to update user", error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: updated_user }, { status: 200 });
}