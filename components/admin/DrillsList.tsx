'use client'

import { DrillsCard } from "@/components/admin/DrillsCard";
import { useDrills } from "@/hooks/drills/use-drills";

export function DrillsList({ refreshKey, searchTerm }: { refreshKey: number, searchTerm: string }) {
    const { drills, loading, error } = useDrills(refreshKey);
    const filteredDrills = drills.filter((drill) => 
        (drill.drill_name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="p-4">Loading drills...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">Error: {error}</div>;
    }

    console.log('filteredDrills: ', filteredDrills);
    return (
        <div className="p-4 space-y-4">
            {filteredDrills.length === 0 ? (
                <div className="text-center text-gray-500">No drills found</div>
            ) : (
                filteredDrills.map((drill) => (
                    <DrillsCard
                        key={drill.id}
                        id={drill.id}
                        title={drill.drill_name}
                        area={drill.area}
                        performance_level={drill.performance_level}
                    />
                ))
            )}
        </div>
    );
}