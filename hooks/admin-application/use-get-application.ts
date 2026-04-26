import { useAuth } from "@/context/user_context";
import { useState, useEffect, useCallback } from "react";

export interface Application {
    applicationId: number;
    status: string;
    submittedAt: string;
}

interface UseGetApplicationResult {
    application: Application | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useGetApplication(): UseGetApplicationResult {
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchApplication = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin-application/${user?.id}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to fetch application");
            }

            setApplication(result.application);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id) {
            fetchApplication();
        }
    }, [fetchApplication, user?.id]);

    return { application, loading, error, refetch: fetchApplication };
}