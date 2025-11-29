import { useState } from 'react';

interface UseDrillHelpfulReturn {
    isLoading: boolean;
    error: string | null;
    markHelpful: (drillId: string) => Promise<void>;
    markNotHelpful: (drillId: string) => Promise<void>;
}

export function useDrillHelpful(): UseDrillHelpfulReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateHelpfulCount = async (drillId: string, action: 'helpful' | 'not_helpful') => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/admin/drills/${drillId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update helpful count');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const markHelpful = async (drillId: string) => {
        return updateHelpfulCount(drillId, 'helpful');
    };

    const markNotHelpful = async (drillId: string) => {
        return updateHelpfulCount(drillId, 'not_helpful');
    };

    return {
        isLoading,
        error,
        markHelpful,
        markNotHelpful,
    };
}