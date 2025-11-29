import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { is_active } = await request.json();

        const { error } = await supabase
            .from('users')
            .update({ is_active })
            .eq('id', id)
            .eq('user_role', 'admin');

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error toggling admin status:", error);
        return NextResponse.json(
            { message: "Failed to update admin status", error },
            { status: 500 }
        );
    }
}