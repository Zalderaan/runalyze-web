import { useState, useEffect, useCallback } from "react";

interface SubmittedFile {
    id: number;
    fileName: string;
    fileType: string;
    uploadedAt: string;
    url: string | null;
}

interface UseGetSubmittedResult {
    files: SubmittedFile[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useGetSubmitted(applicationId: number | null): UseGetSubmittedResult {
    const [files, setFiles] = useState<SubmittedFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFiles = useCallback(async () => {
        if (!applicationId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/admin-application/submitted-docs/${applicationId}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to fetch files");
            }

            setFiles(result.files);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch files");
        } finally {
            setLoading(false);
        }
    }, [applicationId]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    return { files, loading, error, refetch: fetchFiles };
}