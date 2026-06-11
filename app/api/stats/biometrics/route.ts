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

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = newUrl(req.url);
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 100;
    const includeDeleted = searchParams.get("include_deleted") === "true";

    let query = supabase
      .from("user_biometric_snapshots")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(limit);

    if (!includeDeleted) {
      query = query.eq("is_deleted", false);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching biometrics:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { height_cm, weight_kg, recorded_at, notes } = body;

    if (!height_cm && !weight_kg) {
      return NextResponse.json({ message: "Height or weight is required" }, { status: 400 });
    }

    const payload = {
      user_id: userId,
      height_cm: height_cm ? Number(height_cm) : null,
      weight_kg: weight_kg ? Number(weight_kg) : null,
      recorded_at: recorded_at ? new Date(recorded_at).toISOString() : new Date().toISOString(),
      notes: notes || null,
      is_deleted: false,
      deleted_at: null
    };

    const { data, error } = await supabase
      .from("user_biometric_snapshots")
      .insert(payload)
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation (code 23505 in postgres)
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "An entry already exists for this date and time." },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating biometric entry:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

// Helper function to resolve relative/absolute url
function newUrl(urlStr: string) {
  return new URL(urlStr);
}
