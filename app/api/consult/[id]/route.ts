import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth/session';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ...existing code...

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        const { status, is_archived } = await req.json();  // Expect { status: "completed" | "accepted" | etc. }

        // Authenticate user
        const cookieStore = await cookies();
        const cookie = cookieStore.get("session")?.value;
        if (!cookie) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }
        const session = await decrypt(cookie);
        if (!session?.userId) {
            return NextResponse.json(
                { message: "Invalid session" },
                { status: 401 }
            );
        }

        // Get consultation details
        const { data: consultation, error: fetchError } = await supabase
            .from('consultations')
            .select('user_id, coach_id, status, is_archived, user_email')
            .eq('id', id)
            .single();

        if (fetchError || !consultation) {
            return NextResponse.json(
                { message: "Consultation not found" },
                { status: 404 }
            );
        }

        // Check user role (assume session has 'role' or query DB for 'is_admin')
        // const { data: userRole } = await supabase
        //     .from('users')
        //     .select('user_role')
        //     .eq('id', session.userId)
        //     .single();

        const isCoach = session.user_role == "admin"
        const isOwner = consultation.user_id === session.userId;
        const isAssignedCoach = consultation.coach_id === session.userId;

        // ? Debug logs
        // console.log("session", session);
        // console.log("isCoach", isCoach);
        // console.log("isOwner", isOwner);
        // console.log("isAssignedCoach", isAssignedCoach);

        let updateFields: any = { updated_at: new Date().toISOString };

        // Authorization logic
        if (status) {
            // Only validate if status is actually changing
            if (status !== consultation.status) {
                if (isOwner && !isCoach) {
                    // User can mark as "completed" (anytime) or "cancelled" (only if pending)
                    if (status === "cancelled") {
                        if (consultation.status !== "pending") {
                            return NextResponse.json(
                                { message: "Cannot cancel a consultation that has already been accepted" },
                                { status: 403 }
                            );
                        }
                    } else if (status !== "completed") {
                        return NextResponse.json(
                            { message: "Users can only mark consultations as completed or cancelled" },
                            { status: 403 }
                        );
                    }
                } else if (isAssignedCoach && isCoach) {
                    // Coach can update to "accepted", "in-progress", etc.
                    const validCoachStatuses = ["accepted", "in-progress", "completed", "declined", "cancelled"];
                    if (!validCoachStatuses.includes(status)) {
                        return NextResponse.json(
                            { message: "Invalid status for coach update" },
                            { status: 400 }
                        );
                    }
                } else {
                    return NextResponse.json(
                        { message: "Unauthorized" },
                        { status: 403 }
                    );
                }
            }
            updateFields.status = status;
        }

        if (is_archived !== undefined) {
            // allow only if the user is the owner or is the assigned coach
            if (!isOwner && !isAssignedCoach) {
                return NextResponse.json(
                    { message: "Unauthorized to archive" },
                    { status: 403 }
                )
            }
            updateFields.is_archived = is_archived;
        }

        // Update the consultation
        const { data, error: updateError } = await supabase
            .from('consultations')
            .update(updateFields)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        // Send notification email to the user if a coach changed the status
        if (isCoach && status && status !== consultation.status && data?.user_email) {
            const statusMap: Record<string, string> = {
                'in-progress': 'Accepted',
                'completed': 'Completed',
                'declined': 'Declined',
            };
            const friendlyStatus = statusMap[status] || status;
            
            if (['in-progress', 'completed', 'declined'].includes(status)) {
                await resend.emails.send({
                    from: 'Runalyze Notifications <noreply@mail.runalyze.online>',
                    to: data.user_email,
                    subject: `Consultation Update: ${friendlyStatus}`,
                    html: `
                        <h2>Consultation Status Update</h2>
                        <p>Your consultation request has been updated.</p>
                        <p><strong>New Status:</strong> ${friendlyStatus}</p>
                        <p>Log in to your Runalyze dashboard for more details.</p>
                    `
                });
            }
        }

        return NextResponse.json(
            { message: "Consultation updated successfully", consultation: data },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Error updating consultation: ", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        // Authenticate user
        const cookieStore = await cookies();
        const cookie = cookieStore.get("session")?.value;
        if (!cookie) {
            return NextResponse.json(
                { message: "Not authenticated" },
                { status: 401 }
            );
        }
        const session = await decrypt(cookie);
        if (!session?.userId) {
            return NextResponse.json(
                { message: "Invalid session" },
                { status: 401 }
            );
        }

        // Verify the consultation belongs to the user
        const { data: consultation, error: fetchError } = await supabase
            .from('consultations')
            .select('user_id, status')
            .eq('id', id)
            .single();

        if (fetchError || !consultation) {
            return NextResponse.json(
                { message: "Consultation not found" },
                { status: 404 }
            );
        }

        if (consultation.user_id !== session.userId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 403 }
            );
        }

        // Optional: Prevent deletion if status is "in-progress"
        if (consultation.status === "in-progress") {
            return NextResponse.json(
                { message: "Cannot delete an in-progress consultation" },
                { status: 400 }
            );
        }

        // Delete the consultation
        const { error: deleteError } = await supabase
            .from('consultations')
            .delete()
            .eq('id', id);

        if (deleteError) {
            throw deleteError;
        }

        return NextResponse.json(
            { message: "Consultation deleted successfully" },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Error deleting consultation: ", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}