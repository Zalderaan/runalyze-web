'use client'

import { DrillsCard } from "@/components/admin/DrillsCard";
import { useDrills } from "@/hooks/use-drills";

export function DrillsList() {
    const { drills, loading, error } = useDrills();
    
    if (loading) {
        return <div className="p-4">Loading drills...</div>;
    }
    
    if (error) {
        return <div className="p-4 text-red-600">Error: {error}</div>;
    }
    
    return (
        <div className="p-4 space-y-4">
            {drills.length === 0 ? (
                <div className="text-center text-gray-500">No drills found</div>
            ) : (
                drills.map((drill) => (
                    <DrillsCard 
                        key={drill.id}
                        title={drill.drill_name}
                        area={drill.area}
                        performance_level={drill.performance_level}
                    />
                ))
            )}
        </div>
    );   
}