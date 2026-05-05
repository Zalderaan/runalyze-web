import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'

/**
 * GET /api/admin/drill-templates
 * Returns the list of all drill templates for the "select existing" dropdown.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';

        let query = supabase
            .from('drill_templates')
            .select('id, name, video_url, thumbnail_url, instructions, justification, reference, helpful_count, not_helpful_count, created_at, drills(count)')
            .order('name', { ascending: true });

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching drill templates:", error);
            return NextResponse.json(
                { message: "Error fetching drill templates", error: error.message },
                { status: 500 }
            );
        }

        // Flatten the drills(count) relation into a plain drills_count number
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const templates = (data ?? []).map((t: any) => {
            const { drills, ...rest } = t;
            return { ...rest, drills_count: (drills as Array<{ count: number }>)?.[0]?.count ?? 0 };
        });

        return NextResponse.json(
            { templates },
            { status: 200 }
        );
    } catch (error) {
        console.error("Server error fetching drill templates:", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
