import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth/session';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { coach_id, message } = await req.json();

        // get user id
        const cookieStore = await cookies();
        const cookie = cookieStore.get("session")?.value;
        if (!cookie) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }
        const session = await decrypt(cookie);
        const user_id = session?.userId;

        // get coach and user details
        const { data: user } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', user_id)
            .single();

        const { data: coach } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', coach_id)
            .single();

        if (!coach?.email) {
            return NextResponse.json(
                { message: "Coach email not found" },
                { status: 404 }
            );
        }

        // store consultation in database
        const { data, error } = await supabase
            .from('consultations')
            .insert({
                user_id,
                coach_id,
                message,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        // TODO: Send email to coach's email
        // Send email to coach
        await resend.emails.send({
            from: 'Runalyze <noreply@yourdomain.com>', // Use your verified domain
            to: coach.email,
            subject: 'New Consultation Request',
            html: `
                <h2>New Consultation Request</h2>
                <p><strong>From:</strong> ${user?.name || 'A user'} (${user?.email})</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                <br>
                <p>Log in to your dashboard to respond to this request.</p>
            `
        });

        return NextResponse.json(
            { message: "Consultation request sent successfully", consultation: data },
            { status: 200 }
        )


    } catch (error: any) {
        console.error("Error sending consultation email");
        return NextResponse.json(
            { message: "Error sending consultation email: ", error: error.message },
            { status: 500 }
        );
    }
}