'use client'

import { useEffect, useState } from "react";

// Define the Drill interface
export interface Drill {
    id: string | number;
    drill_name: string;
    area: string;
    performance_level: string;
    video_url: string;
    frequency: number;
    sets: number;
    reps: number;
    instructions: {
        steps: Array<string>
    }
    created_at: Date;
    updated_at: Date;
}

export function useDrills(refreshKey?: number) {
    const [drills, setDrills] = useState<Drill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    // const [drillLoading, setDrillLoading] = useState(false);
    // const [drillError, setDrillError] = useState<string | null>(null);

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

    // async function getDrill(id: string | number) {
    //     setDrillLoading(true);
    //     setDrillError(null);
    //     try {
    //         const res = await fetch(`/api/admin/drills/${id}`)

    //         if (!res.ok) {
    //             const errorData = await res.json();
    //             throw new Error(errorData.message || "Failed to fetch drill details");
    //         }
    //         const { drill } = await res.json();
    //         return drill;
    //     } catch (error) {
    //         setDrillError(error instanceof Error ? error.message : String(error));
    //         return null;
    //     } finally {
    //         setDrillLoading(false)
    //     }
    // }

    async function addDrill(formPayload: any) {
        setAddLoading(true);
        setAddError(null);
        try {
            const res = await fetch("/api/admin/drills", {
                method: "POST",
                body: formPayload,
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

    return { 
        drills, 
        loading, 
        error, 
        addDrill, 
        addLoading, 
        addError,
        // getDrill,
        // drillLoading,
        // drillError
    };
}