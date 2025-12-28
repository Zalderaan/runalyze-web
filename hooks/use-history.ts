import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/user_context';
import router from 'next/router';

export interface HistoryItem {
    id: number;
    created_at: string;
    head_position: number;
    back_position: number;
    arm_flexion: number;
    right_knee: number;
    left_knee: number;
    foot_strike: number;
    overall_score: number;
    video_id: number;
    user_id: number;
    videos: {
        video_url: string;
        thumbnail_url: string;
    }[];
}

let hasFetched = false;

export function useHistory() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);

    const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const { user } = useAuth();

    const fetchHistory = async () => {
        // if (hasFetched) return;
        // hasFetched = true;

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

    const getLatestAnalysis = () => {
        return history.length > 0 ? history[0] : null;
    };

    const getAnalysisDetails = useCallback(async (aid: string) => {
        setIsLoadingDetails(true);
        setDetailsError(null);

        try {
            const response = await fetch(`/api/history/${aid}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to get analysis details');
            }

            const data = await response.json();
            console.log("data.analysis: ", data.analysis)
            return data.analysis;
        } catch (error) {
            console.error("Error getting analysis details: ", error);
            setError(error instanceof Error ? error.message : 'Error fetching analysis details');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // fetch history when component mounts or user changes
    useEffect(() => {
        if (user) {
            fetchHistory();
        } else {
            setHistory([]);
            hasFetched = false; // optional reset if user logs out
        }
    }, [user]);

    const deleteAnalysis = async (analysisId: string) => {
        setIsLoadingDelete(true);
        setDeleteError(null);

        try {
            const response = await fetch(`/api/history/${analysisId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete analysis');
            }

            const result = await response.json();
            // console.log(result.message);
            
            // Refresh the history list after successful deletion
            await fetchHistory();
            return { success: true, message: result.message }
        } catch (error) {
            console.error("Error deleting analysis: ", error);
        }
    }

    return {
        history,
        isLoading,
        error,
        isLoadingDetails,
        detailsError,
        isLoadingDelete,
        deleteError,
        fetchHistory,
        getLatestAnalysis,
        getAnalysisDetails,
        deleteAnalysis
    }
}