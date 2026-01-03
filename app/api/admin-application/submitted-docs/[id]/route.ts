import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Authenticate user
        const cookieStore = await cookies();
        const cookie = cookieStore.get("session")?.value;
        if (!cookie) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const session = await decrypt(cookie);
        if (!session?.userId) {
            return NextResponse.json(
                { error: "Invalid session" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const applicationId = parseInt(id);

        // Get file metadata for the application
        const { data: files, error: filesError } = await supabase
            .from("admin_applications_metadata")
            .select("id, file_path, file_type, uploaded_at")
            .eq("application_id", applicationId);

        if (filesError) {
            console.error("Error fetching files:", filesError);
            return NextResponse.json(
                { error: "Failed to fetch files" },
                { status: 500 }
            );
        }

        // Generate signed URLs for each file
        const filesWithUrls = await Promise.all(
            (files || []).map(async (file) => {
                const { data: signedUrl } = await supabase.storage
                    .from("admin-applications")
                    .createSignedUrl(file.file_path, 3600);

                return {
                    id: file.id,
                    fileName: file.file_path.split("/").pop(),
                    fileType: file.file_type,
                    uploadedAt: file.uploaded_at,
                    url: signedUrl?.signedUrl || null,
                };
            })
        );

        return NextResponse.json({ files: filesWithUrls }, { status: 200 });

    } catch (error) {
        console.error("Failed to get applicant's documents: ", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Authenticate user
        const cookieStore = await cookies();
        const cookie = cookieStore.get("session")?.value;
        if (!cookie) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const session = await decrypt(cookie);
        if (!session?.userId) {
            return NextResponse.json(
                { error: "Invalid session" },
                { status: 401 }
            );
        }

        // find user application id
        const { id } = await params;
        const fileId = parseInt(id);

        // 1. Get file metadata to find the storage path
        const { data: fileData, error: fetchError } = await supabase
            .from("admin_applications_metadata")
            .select("id, file_path, application_id")
            .eq("id", fileId)
            .single()

        if (fetchError || !fileData) {
            return NextResponse.json(
                { error: "File not found" },
                { status: 404 }
            )
        }

        // 2. Delete from storage
        const { error: storageDeleteError } = await supabase.storage
            .from("admin-applications")
            .remove([fileData.file_path]);

        if (storageDeleteError) {
            console.error("Storage deletion error: ", storageDeleteError);
            return NextResponse.json(
                { error: "Failed to delete file from storage" },
                { status: 500 }
            )
        }

        // 3. Delete metadata from db
        const { error: dbDeleteError } = await supabase
            .from("admin_applications_metadata")
            .delete()
            .eq("id", fileId)

        if (dbDeleteError) {
            return NextResponse.json(
                { error: "Failed to delete file metadata from database" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "File deleted successfully!" },
            { status: 200 }
        )

    } catch (error) {
        console.error("Failed to delete user document: ", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}