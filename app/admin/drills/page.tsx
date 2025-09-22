// UI Imports
import { Button } from "@/components/ui/button"

// Icons
import { Plus } from "lucide-react"

import { DrillsList } from "@/components/admin/DrillsList"
import { AddDrillDialog } from "@/components/admin/AddDrillDialog"


export default function AdminDrills() {
    return (
        <main className="flex flex-col space-y-5">
            <div className="flex flex-row items-center justify-between">
                <h1 className="font-semibold text-3xl">Drills</h1>
                <AddDrillDialog />
            </div>

            <DrillsList />
        </main>
    )
}