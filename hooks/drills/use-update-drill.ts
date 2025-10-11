import { useState } from "react";

export function useUpdateDrill() {
    const [updateLoading, setUpdateLoading] = useState(false)
    const [isUpdateError, setIsUpdateError] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null)
    
    
    async function updateDrill(formPayload: any, id: string | number) {
        setUpdateLoading(true);
        setIsUpdateError(false);

        try {
            const res = await fetch(`/api/admin/drills/${id}`, {
                method: "PUT",
                body: formPayload
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to update drill");
            }
            return await res.json();
        } catch (error) {
            // throw error
            setIsUpdateError(true)
            if (error instanceof Error) {
                setUpdateError(error.message);
            } else {
                setUpdateError(String(error))
            }
        } finally {
            setUpdateLoading(false)
        }
    }

    return {
        updateDrill,
        updateLoading,
        setIsUpdateError,
        updateError
    }
}