import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth/session';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ...existing code...

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { status, dismiss } = await req.json();  // Expect { status: "completed" | "accepted" | etc. }

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
            .select('user_id, coach_id, status, is_archived, user_email, coach_email, cancel_requested_by, complete_requested_by, hidden_by_user, hidden_by_coach')
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateFields: Record<string, any> = { updated_at: new Date().toISOString() };

        // Authorization logic
        if (status) {
            if (status !== consultation.status) {
                // --- PRE-ACCEPTANCE: User can cancel pending freely ---
                if (status === "cancelled" && consultation.status === "pending") {
                    if (!isOwner) {
                        return NextResponse.json({ message: "Only the requester can cancel a pending consultation" }, { status: 403 });
                    }
                }
                // --- REQUEST CANCEL (from in-progress) ---
                else if (status === "cancel-requested" && consultation.status === "in-progress") {
                    if (!isOwner && !isAssignedCoach) {
                        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
                    }
                    updateFields.cancel_requested_by = session.userId;
                }
                // --- APPROVE CANCEL (from cancel-requested → cancelled) ---
                else if (status === "cancelled" && consultation.status === "cancel-requested") {
                    if (!isOwner && !isAssignedCoach) {
                        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
                    }
                    if (String(consultation.cancel_requested_by) === String(session.userId)) {
                        return NextResponse.json({ message: "Waiting for the other party to approve cancellation" }, { status: 403 });
                    }
                }
                // --- REJECT CANCEL (from cancel-requested → back to in-progress) ---
                else if (status === "in-progress" && consultation.status === "cancel-requested") {
                    if (!isOwner && !isAssignedCoach) {
                        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
                    }
                    if (String(consultation.cancel_requested_by) === String(session.userId)) {
                        return NextResponse.json({ message: "You cannot reject your own cancel request" }, { status: 403 });
                    }
                    updateFields.cancel_requested_by = null;
                }
                // --- REQUEST COMPLETE (from in-progress) ---
                else if (status === "complete-requested" && consultation.status === "in-progress") {
                    if (!isOwner && !isAssignedCoach) {
                        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
                    }
                    updateFields.complete_requested_by = session.userId;
                }
                // --- APPROVE COMPLETE (from complete-requested → completed) ---
                else if (status === "completed" && consultation.status === "complete-requested") {
                    if (!isOwner && !isAssignedCoach) {
                        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
                    }
                    if (String(consultation.complete_requested_by) === String(session.userId)) {
                        return NextResponse.json({ message: "Waiting for the other party to confirm completion" }, { status: 403 });
                    }
                }
                // --- REJECT COMPLETE (from complete-requested → back to in-progress) ---
                else if (status === "in-progress" && consultation.status === "complete-requested") {
                    if (!isOwner && !isAssignedCoach) {
                        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
                    }
                    if (String(consultation.complete_requested_by) === String(session.userId)) {
                        return NextResponse.json({ message: "You cannot reject your own completion request" }, { status: 403 });
                    }
                    updateFields.complete_requested_by = null;
                }
                // --- COACH ACCEPTS pending → in-progress ---
                else if (status === "in-progress" && consultation.status === "pending") {
                    if (!isAssignedCoach || !isCoach) {
                        return NextResponse.json({ message: "Only the assigned coach can accept" }, { status: 403 });
                    }
                }
                // --- COACH DECLINES pending → declined ---
                else if (status === "declined" && consultation.status === "pending") {
                    if (!isAssignedCoach || !isCoach) {
                        return NextResponse.json({ message: "Only the assigned coach can decline" }, { status: 403 });
                    }
                }
                // --- All other transitions are invalid ---
                else {
                    return NextResponse.json({ message: "Invalid status transition" }, { status: 400 });
                }
            }
            updateFields.status = status;
        }

        if (dismiss === true) {
            // Only allow dismissing terminal consultations
            const terminalStatuses = ['completed', 'cancelled', 'declined'];
            if (!terminalStatuses.includes(consultation.status)) {
                return NextResponse.json(
                    { message: "Can only dismiss concluded consultations" },
                    { status: 400 }
                );
            }

            if (isOwner) {
                updateFields.hidden_by_user = true;
                // If coach already dismissed, schedule purge
                if (consultation.hidden_by_coach) {
                    updateFields.purge_after = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
                }
            } else if (isAssignedCoach) {
                updateFields.hidden_by_coach = true;
                // If user already dismissed, schedule purge
                if (consultation.hidden_by_user) {
                    updateFields.purge_after = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
                }
            } else {
                return NextResponse.json(
                    { message: "Unauthorized" },
                    { status: 403 }
                );
            }
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

        // Send notification email if a status change occurred
        if (status && status !== consultation.status && data) {
            const statusMap: Record<string, string> = {
                'in-progress': 'Accepted',
                'completed': 'Completed',
                'declined': 'Declined',
                'cancel-requested': 'Cancellation Requested',
                'cancelled': 'Cancelled',
                'complete-requested': 'Completion Requested',
            };
            const friendlyStatus = statusMap[status] || status;

            // Determine recipient: notify the OTHER party
            const recipientEmail = (String(session.userId) === String(consultation.user_id))
                ? consultation.coach_email  // user made the change, notify coach
                : data.user_email;          // coach made the change, notify user

            if (recipientEmail) {
                await resend.emails.send({
                    from: 'Runalyze Notifications <noreply@mail.runalyze.online>',
                    to: recipientEmail,
                    subject: `Consultation Update: ${friendlyStatus}`,
                    html: `
                        <h2>Consultation Status Update</h2>
                        <p>A consultation has been updated.</p>
                        <p><strong>New Status:</strong> ${friendlyStatus}</p>
                        <p>Log in to your Runalyze dashboard to take action.</p>
                    `
                });
            }
        }

        return NextResponse.json(
            { message: "Consultation updated successfully", consultation: data },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error updating consultation: ", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { message: "Internal server error", error: errorMessage },
            { status: 500 }
        );
    }
}