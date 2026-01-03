import { useState, useEffect } from "react";

interface ApplicationCounts {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export function useApplicationsCount() {
    const [counts, setCounts] = useState<ApplicationCounts>({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCounts = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin-application/count");

            if (!res.ok) {
                throw new Error("Failed to fetch application counts");
            }

            const data = await res.json();
            setCounts(data);
        } catch (err) {
            console.error("Error fetching application counts:", err);
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCounts();
    }, []);

    return { counts, isLoading, error, refetch: fetchCounts };
}