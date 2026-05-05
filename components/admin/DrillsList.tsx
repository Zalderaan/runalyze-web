'use client'

import { DrillsCard } from "@/components/admin/DrillsCard";
import { useDrills } from "@/hooks/drills/use-drills";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DrillsListProps {
    refreshKey: number;
    searchTerm: string;
    area: string;
    performanceLevel: string;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export function DrillsList({
    refreshKey,
    searchTerm,
    area,
    performanceLevel,
    currentPage,
    itemsPerPage,
    onPageChange
}: DrillsListProps) {
    const { drills, pagination, loading, error } = useDrills(
        currentPage,
        itemsPerPage,
        searchTerm,
        refreshKey,
        area,
        performanceLevel
    );

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                {[...Array(itemsPerPage)].map((_, i) => (
                    <div key={i} className="h-[250px] rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="space-y-8">
            <div className="p-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {drills.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-500">
                        <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-zinc-300">
                            <ChevronLeft className="h-8 w-8 rotate-90" />
                        </div>
                        <p className="font-medium">No drills found</p>
                        <p className="text-sm opacity-70">Try adjusting your search terms</p>
                    </div>
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
                            thumbnail_url={drill.thumbnail_url}
                        />
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-6 border-t border-zinc-100 dark:border-zinc-800 mt-10">
                    <div className="text-sm text-zinc-500">
                        Showing <span className="font-bold text-zinc-900 dark:text-zinc-100">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {Math.min(currentPage * itemsPerPage, pagination.total)}
                        </span> of{" "}
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{pagination.total}</span> drills
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-1">
                            {[...Array(pagination.totalPages)].map((_, i) => {
                                const page = i + 1;
                                // Simple logic to show current page and neighbors
                                if (
                                    page === 1 || 
                                    page === pagination.totalPages || 
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                    return (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "ghost"}
                                            size="icon"
                                            className="h-8 w-8 text-xs"
                                            onClick={() => onPageChange(page)}
                                        >
                                            {page}
                                        </Button>
                                    );
                                } else if (
                                    (page === currentPage - 2 && page > 1) ||
                                    (page === currentPage + 2 && page < pagination.totalPages)
                                ) {
                                    return <span key={page} className="text-zinc-400">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === pagination.totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}