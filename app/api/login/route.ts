'use server'

import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    // find user by email
    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !users) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // compare hashed password
    const passwordMatches = await bcrypt.compare(password, users.password);
    if (!passwordMatches) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // * success: return user info
    return NextResponse.json(
        { userId: users.id, username: users.username, email: users.email }, 
        { status: 200 }
    )
} 