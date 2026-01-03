'use client'

import { DrillsList } from "@/components/admin/DrillsList"
import { AddDrillDialog } from "@/components/admin/AddDrillDialog"
import { useState } from "react"
import { SearchInput } from "@/components/admin/SearchInput";
import { RoleGuard } from "@/components/RoleGuard";

export default function AdminDrills() {
    const [searchTerm, setSearchTerm] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    function handleDrillAdded() {
        setRefreshKey((k) => k + 1);
        setCurrentPage(1); // Reset to first page when adding new drill
    }

    return (
        <RoleGuard allowedRoles={["owner", "admin"]}>
            <main className="flex flex-col space-y-5">
                <div className="flex flex-row items-center justify-between">
                    <h1 className="font-semibold text-3xl">Drills</h1>

                    <div className="flex flex-row items-center justify-between space-x-5">
                        <SearchInput value={searchTerm} onChange={setSearchTerm} />
                        <AddDrillDialog onSuccess={handleDrillAdded} />
                    </div>
                </div>

                <DrillsList
                    refreshKey={refreshKey}
                    searchTerm={searchTerm}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </main>
        </RoleGuard>
    )
}