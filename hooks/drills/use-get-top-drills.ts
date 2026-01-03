import { useState, useEffect } from "react";

interface TopDrill {
    id: number;
    drill_name: string;
    area: string;
    performance_level: string;
    helpful_count: number;
    not_helpful_count: number;
}

export function useGetTopDrills() {
    const [topDrills, setTopDrills] = useState<TopDrill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTopDrills = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/drills/top-5");

            if (!res.ok) {
                throw new Error("Failed to fetch top drills");
            }

            const { data } = await res.json();
            setTopDrills(data);
        } catch (err) {
            console.error("Error fetching top drills:", err);
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTopDrills();
    }, []);

    return {
        topDrills,
        isLoading,
        error,
        refetch: fetchTopDrills
    };
}