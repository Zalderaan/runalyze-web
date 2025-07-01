import { useState, useEffect } from 'react';
import { useAuth } from '@/context/user_context';

interface HistoryItem {
    overall_score: number;
    title: string,
    created_at: string
}

export function useHistory() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchHistory = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/history');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch user history');
            }

            const data = await response.json();
            setHistory(data.history || []);
        } catch (error) {
            console.error('Error fetching history: ', error);
            setError(error instanceof Error ? error.message : 'Error fetching history');
        } finally {
            setIsLoading(false);
        }
    }

    // fetch history when component mounts or user changes
    useEffect(() => {
        if (user) {
            fetchHistory();
        } else {
            setHistory([]);
        }
    }, [user]);

    return {
        history,
        isLoading,
        error,
        fetchHistory
    }
}