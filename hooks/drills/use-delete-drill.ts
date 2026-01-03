import { useState } from "react";

export function useDeleteDrill(id: string | number | undefined) {
    const [isDrillDeleting, setIsDrillDeleting] = useState(false)
    const [isDrillDeleteError, setIsDrillDeleteError] = useState(false)
    const [drillDeleteError, setDrillError] = useState<string | null>(null)
    const [isDrillDeleted, setIsDrillDeleted] = useState(false)

    async function deleteDrill() {
        setIsDrillDeleting(true);
        setIsDrillDeleteError(false);
        setIsDrillDeleted(false)
        setDrillError(null);

        try {

            const res = await fetch(`/api/admin/drills/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                setIsDrillDeleteError(true);
                const errorData = await res.json();
                setDrillError(errorData.message || "Failed to delete drill");
                return;
            }

            // // delete backend cache
            await fetch(`https://runalyze-python.onrender.com/drills/clear-cache/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            // await fetch('http://localhost:8000/drills/clear-cache/', {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     }
            // });
            setIsDrillDeleted(true) // successful delete

        } catch (error) {
            setIsDrillDeleteError(true);
            setDrillError(error instanceof Error ? error.message : String(error));
            console.error("Error deleting drill in hook layer: ", error);
        } finally {
            setIsDrillDeleting(false);
        }
    }

    return {
        deleteDrill,
        isDrillDeleted,
        isDrillDeleting,
        isDrillDeleteError,
        drillDeleteError,
    }
}