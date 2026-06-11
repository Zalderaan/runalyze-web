import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/session";
import { secondsToMMSS } from "@/lib/stats/formatters";

async function getUserIdFromSession(): Promise<number | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  if (!cookie) return null;
  const session = await decrypt(cookie);
  const userId = session?.userId;
  return userId ? Number(userId) : null;
}

export async function GET() {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    // Direct aggregation using Supabase Select or postgres function. Since we don't have RPC,
    // we can query the columns and compute min client-side or use supabase filter logic.
    // Querying all non-deleted snapshots and finding min is clean and simple.
    const { data, error } = await supabase
      .from("user_performance_snapshots")
      .select("time_3k_secs, time_5k_secs, time_10k_secs")
      .eq("user_id", userId)
      .eq("is_deleted", false);

    if (error) throw error;

    let time_3k: number | null = null;
    let time_5k: number | null = null;
    let time_10k: number | null = null;

    if (data && data.length > 0) {
      for (const row of data) {
        if (row.time_3k_secs !== null) {
          time_3k = time_3k === null ? row.time_3k_secs : Math.min(time_3k, row.time_3k_secs);
        }
        if (row.time_5k_secs !== null) {
          time_5k = time_5k === null ? row.time_5k_secs : Math.min(time_5k, row.time_5k_secs);
        }
        if (row.time_10k_secs !== null) {
          time_10k = time_10k === null ? row.time_10k_secs : Math.min(time_10k, row.time_10k_secs);
        }
      }
    }

    return NextResponse.json({
      data: {
        time_3k,
        time_5k,
        time_10k,
        time_3k_formatted: secondsToMMSS(time_3k),
        time_5k_formatted: secondsToMMSS(time_5k),
        time_10k_formatted: secondsToMMSS(time_10k),
      }
    }, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error getting personal bests:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
