'use client'

import { useEffect, useState } from "react";

export interface Drill {
    id: string | number;
    drill_name: string;
    area: string;
    performance_level: string;
    video_url: string;
    frequency: number;
    sets: number;
    reps: number;
    rep_type: string;
    instructions: {
        steps: Array<string>
    };
    helpful_count: number;
    not_helpful_count: number;
    created_at: Date;
    updated_at: Date;
}

export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export function useDrills(page = 1, limit = 10, searchTerm = "", refreshKey?: number) {
    const [drills, setDrills] = useState<Drill[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    useEffect(() => {
        fetchDrills();
    }, [refreshKey, page, limit, searchTerm]);

    async function fetchDrills() {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search: searchTerm
            });
            
            const res = await fetch(`/api/admin/drills?${params}`);
            const { drills, pagination } = await res.json();
            setDrills(drills);
            setPagination(pagination);
        } catch (err) {
            setError("Failed to fetch drills");
        } finally {
            setLoading(false);
        }
    }

    async function addDrill(formPayload: FormData) {
        setAddLoading(true);
        setAddError(null);
        try {
            const res = await fetch("/api/admin/drills", {
                method: "POST",
                body: formPayload,
            });
            if (res.ok) {
                fetchDrills();
            } else {
                setAddError("Failed to add drill");
            }
        } catch (err) {
            setAddError("Failed to add drill");
        } finally {
            // await fetch('http://localhost:8000/drills/clear-cache/', {
            await fetch(`https://runalyze-python.onrender.com/drills/clear-cache/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            setAddLoading(false);
        }
    }

    return {
        drills,
        pagination,
        loading,
        error,
        addDrill,
        addLoading,
        addError,
    };
}