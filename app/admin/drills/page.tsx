'use client'

import { DrillsList } from "@/components/admin/DrillsList"
import { AddDrillDialog } from "@/components/admin/AddDrillDialog"
import { useState } from "react"
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SearchInput } from "@/components/admin/SearchInput";


export default function AdminDrills() {
    const [searchTerm, setSearchTerm] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    function handleDrillAdded() {
        setRefreshKey((k) => k + 1);
    }

    console.log(searchTerm);

    return (
        <main className="flex flex-col space-y-5">
            <div className="flex flex-row items-center justify-between">
                <h1 className="font-semibold text-3xl">Drills</h1>

                <div className="flex flex-row items-center justify-between space-x-5">
                    <SearchInput value={searchTerm} onChange={setSearchTerm}/>
                    <AddDrillDialog onSuccess={handleDrillAdded} />
                </div>
            </div>

            <DrillsList refreshKey={refreshKey} searchTerm={searchTerm}/>
        </main>
    )
}