import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'


export async function POST(req: NextRequest) {
    const formData = await req.formData();

    const drill_name = formData.get("drill_name") as string;
    const area = formData.get("area") as string;
    const performance_level = formData.get("performance_level") as string;
    const duration = formData.get("duration") as string | null;
    const frequency = formData.get("frequency") as string | null;
    const instructionsRaw = formData.get("instructions") as string | null;
    const instructions = instructionsRaw ? JSON.parse(instructionsRaw) : null;
    const sets = formData.get("sets") ? Number(formData.get("sets")) : null;
    const reps = formData.get("reps") ? Number(formData.get("reps")) : null;
    const rep_type = formData.get("rep_type") as string | null;
    const videoFile = formData.get("video") as File | null;
    const justification = formData.get("justification") as string | null;
    const reference = formData.get("reference") as string | null;

    // Add debug logs
    console.log("Extracted justification:", justification);
    console.log("Extracted reference:", reference);
    console.log("All formData keys:", Array.from(formData.keys()));

    let video_url = null;
    const uuid = crypto.randomUUID();

    // upload videoFile to get video_url from supabase
    if (videoFile) {
        const filePath = `drill-videos/${uuid}-${videoFile.name}`;
        const { error } = await supabase.storage
            .from("videos")
            .upload(filePath, videoFile, {
                cacheControl: "3600",
                upsert: false
            });

        if (error) {
            return NextResponse.json(
                {
                    message: "Video upload error",
                    error: error.message || error
                },
                { status: 500 }
            )
        }

        // get the uploaded video's public URL
        const publicUrl = supabase.storage
            .from("videos")
            .getPublicUrl(filePath).data.publicUrl

        video_url = publicUrl;
    }

    try {
        // insert drill
        const { data: newDrill, error: insertError } = await supabase
            .from('drills')
            .insert([{ drill_name, area, performance_level, duration, frequency, video_url, instructions, sets, reps, rep_type, justification, reference }])
            .select()
            .single()

        if (insertError) {
            return NextResponse.json(
                {
                    message: "Database insert error",
                    code: insertError.code,
                    details: insertError.message,
                    hint: insertError.hint
                },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { message: "Drill successfully created", drillId: newDrill.id },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error creating drills: ", error);
        return NextResponse.json(
            { message: "error creating drills: ", error },
            { status: 500 }
        )
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Build query with search filter
        let query = supabase
            .from('drills')
            .select('id, drill_name, area, performance_level, video_url, sets, reps, rep_type, frequency, instructions, justification, reference, helpful_count, not_helpful_count, created_at, updated_at', { count: 'exact' });  // Added missing fields

        // Add search filter if provided
        if (search) {
            query = query.ilike('drill_name', `%${search}%`);
        }

        // Add pagination and ordering
        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error("Error getting drills: ", error);
            return NextResponse.json(
                { message: "Error fetching drills", error: error instanceof Error ? error.message : error },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                drills: data,
                pagination: {
                    total: count || 0,
                    page,
                    limit,
                    totalPages: Math.ceil((count || 0) / limit)
                }
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error getting drills: ", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        )
    }
}

