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

export async function GET(
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

    // Check ownership of snapshot
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

    // Fetch audit entries
    const { data: auditLogs, error: auditError } = await supabase
      .from("user_stat_audit_log")
      .select("*")
      .eq("table_name", "user_biometric_snapshots")
      .eq("snapshot_id", snapshotId)
      .eq("user_id", userId)
      .order("performed_at", { ascending: false });

    if (auditError) throw auditError;

    return NextResponse.json({ data: auditLogs }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching biometric audit log:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
