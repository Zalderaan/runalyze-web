import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth/session';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export async function POST(req: NextRequest) {
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

        // Get form data
        const formData = await req.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: "No files provided" },
                { status: 400 }
            );
        }

        // Validate files
        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: `File ${file.name} exceeds 10MB limit` },
                    { status: 400 }
                );
            }
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json(
                    { error: `File ${file.name} has invalid type. Only PDF, DOC, and DOCX allowed` },
                    { status: 400 }
                );
            }
        }

        // Get or create admin application
        let { data: application, error: appError } = await supabase
            .from("admin_applications")
            .select("application_id")
            .eq("user_id", session.userId)
            .single();

        if (appError && appError.code === 'PGRST116') {
            // Create new application
            const { data: newApp, error: createError } = await supabase
                .from("admin_applications")
                .insert({
                    user_id: session.userId,
                    status: 'pending'
                })
                .select("application_id")
                .single();

            if (createError) {
                console.error("Error creating application:", createError);
                return NextResponse.json(
                    { error: "Failed to create application" },
                    { status: 500 }
                );
            }
            application = newApp;
        } else if (appError) {
            console.error("Error fetching application:", appError);
            return NextResponse.json(
                { error: "Failed to fetch application" },
                { status: 500 }
            );
        }

        const applicationId = application!.application_id;
        const uploadedFiles: Array<{ fileName: string; filePath: string }> = [];

        // Upload files to storage
        for (const file of files) {
            const fileName = `${Date.now()}-${file.name}`;
            const filePath = `${session.userId}/${applicationId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('admin-applications')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error("Error uploading file:", uploadError);
                // Optionally: clean up already uploaded files
                continue;
            }

            // Insert metadata
            const { error: metadataError } = await supabase
                .from("admin_applications_metadata")
                .insert({
                    application_id: applicationId,
                    file_path: filePath,
                    file_type: file.type
                });

            if (metadataError) {
                console.error("Error inserting metadata:", metadataError);
                continue;
            }

            uploadedFiles.push({ fileName: file.name, filePath });
        }

        // Update application status to for_review
        const { error: updateError } = await supabase
            .from("admin_applications")
            .update({
                status: 'for_review',
                submitted_at: new Date().toISOString()
            })
            .eq("application_id", applicationId);

        if (updateError) {
            console.error("Error updating application status:", updateError);
        }

        return NextResponse.json(
            {
                message: "Files uploaded successfully",
                uploadedFiles,
                applicationId
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error submitting applicant's documents:", error);
        return NextResponse.json(
            { error: "Server error encountered" },
            { status: 500 }
        );
    }
}