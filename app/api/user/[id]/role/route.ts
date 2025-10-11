import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    const { role } = await req.json();

    if (!role) {
        return NextResponse.json({ message: "Role is required" }, { status: 400 });
    }

    const { error } = await supabase
        .from("users")
        .update({ user_role: role })
        .eq("id", id);

    if (error) {
        return NextResponse.json({ message: "Failed to update role", error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Role updated successfully" }, { status: 200 });
}