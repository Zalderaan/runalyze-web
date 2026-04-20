'use client'

import { DrillsList } from "@/components/admin/DrillsList"
import { AddDrillDialog } from "@/components/admin/AddDrillDialog"
import { useState } from "react"
import { DrillFilters } from "@/components/admin/DrillFilters";
import { RoleGuard } from "@/components/RoleGuard";
import { useAuth } from "@/context/user_context";

export default function AdminDrills() {
    const [searchTerm, setSearchTerm] = useState("");
    const [area, setArea] = useState("All");
    const [performanceLevel, setPerformanceLevel] = useState("All");
    
    const [refreshKey, setRefreshKey] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    
    const { user } = useAuth();
    const isOwner = user?.user_role === "owner";

    function handleDrillAdded() {
        setRefreshKey((k) => k + 1);
        setCurrentPage(1); // Reset to first page when adding new drill
    }

    return (
        <RoleGuard allowedRoles={["owner", "admin"]}>
            <main className={`flex flex-col space-y-8 pb-10 ${isOwner ? 'theme-owner' : ''}`}>
                 {/* Premium Header */}
                 <div className="relative overflow-hidden rounded-3xl p-8 bg-zinc-900 text-white shadow-xl dark:bg-zinc-950">
                    <div className="relative z-10 flex flex-col gap-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 text-primary/80 mb-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <span className="text-xs font-semibold tracking-wider uppercase">Content Management</span>
                                </div>
                                <h1 className="font-bold text-4xl tracking-tight mb-2">Drill Library</h1>
                                <p className="text-zinc-400 max-w-md text-sm">
                                    Manage and organize your exercise templates and assignments for athletes.
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <AddDrillDialog onSuccess={handleDrillAdded} />
                            </div>
                        </div>

                        <div className="bg-zinc-800/50 dark:bg-zinc-900/50 p-1 rounded-2xl">
                            <DrillFilters 
                                searchTerm={searchTerm}
                                onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                                area={area}
                                onAreaChange={(val) => { setArea(val); setCurrentPage(1); }}
                                performanceLevel={performanceLevel}
                                onPerformanceLevelChange={(val) => { setPerformanceLevel(val); setCurrentPage(1); }}
                            />
                        </div>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
                </div>

                <div className="px-1">
                    <DrillsList
                        refreshKey={refreshKey}
                        searchTerm={searchTerm}
                        area={area}
                        performanceLevel={performanceLevel}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </main>
        </RoleGuard>
    )
}