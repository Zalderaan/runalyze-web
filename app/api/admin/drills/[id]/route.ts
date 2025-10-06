import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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
        console.log("An unexpected error occurred: ", error);
        return NextResponse.json(
            {
                message: "Server error",
                error: error
            },
            { status: 500 }
        )
    }
}
