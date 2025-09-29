'use client'

import { useEffect, useState } from "react";

// Define the Drill interface
interface Drill {
    id: string | number;
    drill_name: string;
    area: string;
    performance_level: string;
}

export function useDrills(refreshKey?: number) {
    const [drills, setDrills] = useState<Drill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    useEffect(() => {
        fetchDrills();
    }, [refreshKey]);

    async function fetchDrills() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/drills");
            const { drills } = await res.json();
            setDrills(drills);
        } catch (err) {
            setError("Failed to fetch drills");
        } finally {
            setLoading(false);
        }
    }

    async function addDrill(newDrill: any) {
        setAddLoading(true);
        setAddError(null);
        try {
            const res = await fetch("/api/admin/drills", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newDrill),
            });
            if (res.ok) {
                fetchDrills(); // Refresh list after adding
            } else {
                setAddError("Failed to add drill");
            }
        } catch (err) {
            setAddError("Failed to add drill");
        } finally {
            setAddLoading(false);
        }
    }

    return { drills, loading, error, addDrill, addLoading, addError };
}