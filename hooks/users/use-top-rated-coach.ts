import { useCallback, useEffect, useState } from "react";

export interface TopRatedCoach {
    id: number;
    username: string;
    email: string;
    avg_rating: number;
    rating_count: number;
}

export function useTopRatedCoach() {
    const [coach, setCoach] = useState<TopRatedCoach | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTopRatedCoach = useCallback(() => {
        setLoading(true);
        fetch("/api/coaches/top-rated")
            .then((res) => res.json())
            .then((data) => {
                setCoach(data.coach || null);
                setError(null);
            })
            .catch((err) => {
                console.error("Failed to fetch top rated coach:", err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchTopRatedCoach();
    }, [fetchTopRatedCoach]);

    return { coach, loading, error, refreshTopRatedCoach: fetchTopRatedCoach };
}
