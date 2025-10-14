import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'

interface DrillUpdateFields {
    drill_name?: string;
    area?: string;
    performance_level?: string;
    sets?: string;
    reps?: string;
    rep_type?: string;
    frequency?: string;
    instructions?: {
        steps: string[];
    } // Replace 'any' with a more specific type if possible
    video_url?: string;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    const paramsObj = await params;
    const id = paramsObj.id;

    try {
        const { data, error } = await supabase
            .from('drills')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error("Error getting drill details: ", error);
            return NextResponse.json(
                { message: 'Error Fetching drill details', error: error instanceof Error ? error.message : error },
                { status: 500 }
            )
        };

        if (!data) {
            return NextResponse.json(
                { message: "Drill not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                message: "Drill details found successfully",
                drill: data
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error getting drill details: ", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        )
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const formData = await req.formData();
    const drill_name = formData.get("drill_name") as string | null;
    const area = formData.get("area") as string | null;
    const performance_level = formData.get("performance_level") as string | null;
    const sets = formData.get("sets") as string | null;
    const reps = formData.get("reps") as string | null;
    const rep_type = formData.get("rep_type") as string | null;
    const frequency = formData.get("frequency") as string | null;
    const instructions = formData.get("instructions") as string | null;

    const videoFile = formData.get("video") as File | null;

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
                    message: "Video upload error while updating drill from api",
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

    // build update object
    const updateFields: DrillUpdateFields = {};
    if (drill_name !== null) updateFields.drill_name = drill_name;
    if (area !== null) updateFields.area = area;
    if (performance_level !== null) updateFields.performance_level = performance_level;
    if (sets !== null) updateFields.sets = sets;
    if (reps !== null) updateFields.reps = reps;
    if (rep_type !== null) updateFields.rep_type = rep_type;
    if (frequency !== null) updateFields.frequency = frequency;
    if (instructions !== null) {
        try {
            updateFields.instructions = JSON.parse(instructions);
        } catch {
            updateFields.instructions = { steps: [instructions] }; // wrap string in object
        }
    }
    if (video_url) updateFields.video_url = video_url;

    try {
        // console.log('This is updateFields object: ', updateFields);
        const { data, error } = await supabase
            .from('drills')
            .update(updateFields)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error("Error updating drill: ", error);
            return NextResponse.json(
                { message: "Error updating drills", error: error instanceof Error ? error.message : error },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { message: "Drill not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Drill updated successfully", drill: data },
            { status: 200 }
        )

    } catch (error) {
        // console.log("Error updating drill in route.ts: ", error);
        return NextResponse.json(
            {
                message: "Server error while updating drill",
                error: error
            },
            {
                status: 500
            }
        )
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const { data, error } = await supabase
            .from("drills")
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (!data) {
            console.error("Drill not found");
            return NextResponse.json(
                { message: "Drill to delete not found" },
                { status: 404 }
            )
        }

        if (error) {
            console.error("Error deleting drill: ", error);
            return NextResponse.json(
                {
                    message: "There was an error deleting a drill",
                    error: error,
                },
                { status: 500 }
            )
        }

        // Success
        return NextResponse.json(
            { message: "Drill deleted successfully", drill: data },
            { status: 200 }
        );

    } catch (error) {
        // console.log("An unexpected error occurred: ", error);
        return NextResponse.json(
            {
                message: "Server error",
                error: error
            },
            { status: 500 }
        )
    }
}
