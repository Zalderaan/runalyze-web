import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/session";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { rating, rating_comment } = await req.json();

        // 1. Validate rating value
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json(
                { message: "Rating must be a number between 1 and 5" },
                { status: 400 }
            );
        }

        // 2. Authenticate user
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

        const userId = Number(session.userId);

        // 3. Fetch the consultation to verify ownership, status, and prior ratings
        const { data: consultation, error: fetchError } = await supabase
            .from("consultations")
            .select("id, user_id, status, rated_at")
            .eq("id", id)
            .single();

        if (fetchError || !consultation) {
            return NextResponse.json(
                { message: "Consultation not found" },
                { status: 404 }
            );
        }

        // 4. Verification checks
        if (consultation.user_id !== userId) {
            return NextResponse.json(
                { message: "Unauthorized: only the client who requested the consultation can rate it" },
                { status: 403 }
            );
        }

        if (consultation.status !== "completed") {
            return NextResponse.json(
                { message: "Cannot rate an incomplete consultation" },
                { status: 400 }
            );
        }

        if (consultation.rated_at) {
            return NextResponse.json(
                { message: "This consultation has already been rated" },
                { status: 400 }
            );
        }

        // 5. Apply the rating
        const { data, error: updateError } = await supabase
            .from("consultations")
            .update({
                rating: rating,
                rating_comment: rating_comment || null,
                rated_at: new Date().toISOString()
            })
            .eq("id", id)
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json(
            { message: "Rating submitted successfully", consultation: data },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error rating consultation: ", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { message: "Internal server error", error: errorMessage },
            { status: 500 }
        );
    }
}
