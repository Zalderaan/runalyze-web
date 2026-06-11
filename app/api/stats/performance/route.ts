import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/session";
import { secondsToMMSS, MMSStoSeconds } from "@/lib/stats/formatters";

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

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 100;
    const includeDeleted = searchParams.get("include_deleted") === "true";

    let query = supabase
      .from("user_performance_snapshots")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(limit);

    if (!includeDeleted) {
      query = query.eq("is_deleted", false);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Inject formatted strings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedData = (data || []).map((row: any) => ({
      ...row,
      time_3k: secondsToMMSS(row.time_3k_secs),
      time_5k: secondsToMMSS(row.time_5k_secs),
      time_10k: secondsToMMSS(row.time_10k_secs),
    }));

    return NextResponse.json({ data: formattedData }, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error fetching performance snapshots:", error);
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
    const { time_3k, time_5k, time_10k, recorded_at, notes } = body;

    const time_3k_secs = time_3k ? MMSStoSeconds(time_3k) : null;
    const time_5k_secs = time_5k ? MMSStoSeconds(time_5k) : null;
    const time_10k_secs = time_10k ? MMSStoSeconds(time_10k) : null;

    if (!time_3k_secs && !time_5k_secs && !time_10k_secs) {
      return NextResponse.json(
        { message: "At least one performance time (3K, 5K, or 10K) is required" },
        { status: 400 }
      );
    }

    const payload = {
      user_id: userId,
      time_3k_secs,
      time_5k_secs,
      time_10k_secs,
      recorded_at: recorded_at ? new Date(recorded_at).toISOString() : new Date().toISOString(),
      notes: notes || null,
      is_deleted: false,
      deleted_at: null
    };

    const { data, error } = await supabase
      .from("user_performance_snapshots")
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "An entry already exists for this date and time." },
          { status: 409 }
        );
      }
      throw error;
    }

    const formattedResponse = {
      ...data,
      time_3k: secondsToMMSS(data.time_3k_secs),
      time_5k: secondsToMMSS(data.time_5k_secs),
      time_10k: secondsToMMSS(data.time_10k_secs),
    };

    return NextResponse.json({ data: formattedResponse }, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error creating performance entry:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
