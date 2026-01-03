import { useState, useEffect } from "react";

export function useGetDrillCount() {
    const [count, setCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCount = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/drills/count");

            if (!res.ok) {
                throw new Error("Failed to fetch drill count");
            }

            const { count } = await res.json();
            setCount(count);
        } catch (err) {
            console.error("Error fetching drill count:", err);
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCount();
    }, []);

    return { count, isLoading, error, refetch: fetchCount };
}