// 'use server'

import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    // find user by email
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !user) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // compare hashed password
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // * success: return user info
    return NextResponse.json(
        {
            userId: user.id,
            username: user.username,
            email: user.email,
            user_role: user.user_role,
            is_active: user.is_active,
            created_at: user.created_at,
            height_cm: user.height_cm,
            weight_kg: user.weight_kg,
            bmi: user.bmi,
            time_3k: user.timek_3k,
            time_5k: user.time_5k,
            time_10k: user.time_10k
        },
        { status: 200 }
    )
}

// export async function GET(req: NextRequest) {
//     const { id } = await req.json();

//     // find user details by user ID
//     const { data: user_details, error } = await supabase
//         .from('users')
//         .select('*')
//         .eq('id', id)
//         .single();

//     if (error || user_details) {
//         return NextResponse.json({ message: "Could not find user details according to ID" }, { status: 404 });
//     }
// }