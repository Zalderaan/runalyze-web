import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

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
            // await fetch('http://localhost:8000/drills/clear-cache/', {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            // });
            await fetch(`${API_URL}/drills/clear-cache/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
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