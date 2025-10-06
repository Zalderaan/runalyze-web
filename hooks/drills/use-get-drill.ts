'use client'

import { useEffect, useState } from "react";
import { type Drill } from '@/hooks/drills/use-drills';

export function useGetDrill(id: string | number |undefined) {
    const [drill, setDrill] = useState<Drill | null>(null);
    const [drillLoading, setDrillLoading] = useState(false);
    const [drillError, setDrillError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            getDrill(id);
        }
    }, [id]);

    async function getDrill(id: string | number) {
        setDrillLoading(true);
        setDrillError(null);
        setDrill(null);
        try {
            const res = await fetch(`/api/admin/drills/${id}`);

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to fetch drill details");
            }
            const { drill } = await res.json();
            // console.log('drill: ', drill);
            setDrill(drill);
        } catch (error) {
            setDrillError(error instanceof Error ? error.message : String(error));
            return null;
        } finally {
            setDrillLoading(false)
        }
    }

    return {
        drill,
        drillLoading,
        drillError,
        refetch: () => id && getDrill(id)
    }
}
