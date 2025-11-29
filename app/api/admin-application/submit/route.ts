import { NextRequest, NextResponse } from "next/server";
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'


export async function POST(req: NextRequest) {
    try {
        const { username, email, password } = await req.json();

        // check if user exists
        const { data: existingUsers, error: selectError } = await supabase
            .from("users")
            .select()
            .eq("email", email);

        if (existingUsers && existingUsers.length > 0) {
            return NextResponse.json(
                { error: "This email is already taken." },
                { status: 409 }
            )
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Use Supabase RPC for transaction
        const { data, error } = await supabase.rpc('create_admin_applicant', {
            p_username: username,
            p_email: email,
            p_password: hashedPassword
        });

        if (error) {
            console.error("Transaction error:", error);
            return NextResponse.json(
                { error: `Failed to create admin application. ${error.message}` },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: "Admin application submitted successfully.",
            applicantUserId: data.user_id,
            applicationId: data.application_id,
        }, { status: 201 });

    } catch (error) {
        console.error("Error registering admin applicant: ", error);
        return NextResponse.json(
            { message: `Error in admin application: ${error}` },
            { status: 500 }
        )
    }
}