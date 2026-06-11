import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/session";

async function getUserIdFromSession(): Promise<number | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  if (!cookie) return null;
  const session = await decrypt(cookie);
  const userId = session?.userId;
  return userId ? Number(userId) : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const paramsObj = await params;
    const snapshotId = Number(paramsObj.id);
    if (isNaN(snapshotId)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();
    const { height_cm, weight_kg, notes, recorded_at, is_deleted } = body;

    // Check ownership first
    const { data: existing, error: fetchError } = await supabase
      .from("user_biometric_snapshots")
      .select("user_id")
      .eq("id", snapshotId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ message: "Snapshot not found" }, { status: 404 });
    }

    if (existing.user_id !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: any = {};
    if (height_cm !== undefined) updatePayload.height_cm = height_cm ? Number(height_cm) : null;
    if (weight_kg !== undefined) updatePayload.weight_kg = weight_kg ? Number(weight_kg) : null;
    if (notes !== undefined) updatePayload.notes = notes || null;
    if (recorded_at !== undefined) updatePayload.recorded_at = new Date(recorded_at).toISOString();
    if (is_deleted !== undefined) {
      updatePayload.is_deleted = !!is_deleted;
      updatePayload.deleted_at = is_deleted ? new Date().toISOString() : null;
    }

    const { data, error: updateError } = await supabase
      .from("user_biometric_snapshots")
      .update(updatePayload)
      .eq("id", snapshotId)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === "23505") {
        return NextResponse.json(
          { message: "An entry already exists for this date and time." },
          { status: 409 }
        );
      }
      throw updateError;
    }

    return NextResponse.json({ data }, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error updating biometric snapshot:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const paramsObj = await params;
    const snapshotId = Number(paramsObj.id);
    if (isNaN(snapshotId)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from("user_biometric_snapshots")
      .select("user_id")
      .eq("id", snapshotId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ message: "Snapshot not found" }, { status: 404 });
    }

    if (existing.user_id !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Soft delete
    const { data, error: deleteError } = await supabase
      .from("user_biometric_snapshots")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq("id", snapshotId)
      .select()
      .single();

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "Deleted successfully", data }, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error deleting biometric snapshot:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
