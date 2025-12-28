'use client'

import { DrillsCard } from "@/components/admin/DrillsCard";
import { useDrills } from "@/hooks/drills/use-drills";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DrillsListProps {
    refreshKey: number;
    searchTerm: string;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export function DrillsList({
    refreshKey,
    searchTerm,
    currentPage,
    itemsPerPage,
    onPageChange
}: DrillsListProps) {
    const { drills, pagination, loading, error } = useDrills(
        currentPage,
        itemsPerPage,
        searchTerm,
        refreshKey
    );

    if (loading) {
        return <div className="p-4">Loading drills...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="space-y-4">
            <div className="p-4 space-y-4">
                {drills.length === 0 ? (
                    <div className="text-center text-gray-500">No drills found</div>
                ) : (
                    drills.map((drill) => (
                        <DrillsCard
                            key={drill.id}
                            id={drill.id}
                            title={drill.drill_name}
                            area={drill.area}
                            performance_level={drill.performance_level}
                            helpful_count={drill.helpful_count}
                            not_helpful_count={drill.not_helpful_count}
                        />
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                    <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
                        <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, pagination.total)}
                        </span> of{" "}
                        <span className="font-medium">{pagination.total}</span> drills
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>

                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {pagination.totalPages}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === pagination.totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}