'use server'

import { NextRequest, NextResponse } from "next/server";
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    try {
        console.log('regiter POST api route accessed!')
        const { email, password, username } = await req.json();

        // Check if user exists
        const { data: existingUsers, error: selectError } = await supabase
            .from('users')
            .select()
            .eq('email', email);


        if (selectError) {
            return NextResponse.json(
                { message: "Database error" },
                { status: 500 }
            );
        }

        if (existingUsers && existingUsers.length > 0) {
            return NextResponse.json(
                { message: "User already exists." },
                { status: 409 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10); // hash password

        // insert user 
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{ email, username, password: hashedPassword }])
            .select()
            .single()

        if (insertError) {
            return NextResponse.json(
                { 
                    message: "Database insert error",
                    code: insertError.code,
                    details: insertError.message,
                    hint: insertError.hint
                },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { message: "Sign up successful", userId: newUser.id },
            { status: 200 }
        )
    } catch (error) {
        console.error('sign-up error: ', error)
        return NextResponse.json(
            { message: "Sign-up error" },
            { status: 500 }
        )
    }
}