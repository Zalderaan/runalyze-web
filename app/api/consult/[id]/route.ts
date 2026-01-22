import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth/session';

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
            .select('user_id, coach_id, status, is_archived')
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
            if (isOwner && !isCoach) {
                // User can only mark as "completed"
                if (status !== "completed") {
                    return NextResponse.json(
                        { message: "Users can only mark consultations as completed" },
                        { status: 403 }
                    );
                }
                updateFields.status = status;
            } else if (isAssignedCoach && isCoach) {
                // Coach can update to "accepted", "in-progress", etc.
                const validCoachStatuses = ["accepted", "in-progress", "completed", "declined", "cancelled"];
                if (!validCoachStatuses.includes(status)) {
                    return NextResponse.json(
                        { message: "Invalid status for coach update" },
                        { status: 400 }
                    );
                }
                updateFields.status = status;
            } else {
                return NextResponse.json(
                    { message: "Unauthorized" },
                    { status: 403 }
                );
            }
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

        // Optional: Prevent deletion if status is "completed" or "in-progress"
        if (consultation.status === "completed" || consultation.status === "in-progress") {
            return NextResponse.json(
                { message: "Cannot delete a completed or in-progress consultation" },
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