'use client'

import { DrillsList } from "@/components/admin/DrillsList"
import { AddDrillDialog } from "@/components/admin/AddDrillDialog"
import { useState } from "react"
import { SearchInput } from "@/components/admin/SearchInput";
import { useAuth } from "@/context/user_context";
import NotFoundPage from "@/app/404/page";
import { RoleGuard } from "@/components/RoleGuard";

export default function AdminDrills() {
    const [searchTerm, setSearchTerm] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const { user } = useAuth();

    const isAuthorized = user?.user_role === "admin" || user?.user_role === "owner"

    // // If user is not admin, show NotFoundPage
    // if (!user || !isAuthorized) {
    //     // console.log('this is user: ', user);
    //     return <NotFoundPage />;
    // }

    function handleDrillAdded() {
        setRefreshKey((k) => k + 1);
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

                <DrillsList refreshKey={refreshKey} searchTerm={searchTerm} />
            </main>
        </RoleGuard>
    )
}