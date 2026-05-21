import { useState } from 'react';
import { toast } from 'sonner';

export function useUpdateDrillTemplate() {
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);

    const updateTemplate = async (formData: FormData, templateId: number | string) => {
        setUpdateLoading(true);
        setUpdateError(null);

        try {
            const response = await fetch(`/api/admin/drill-templates/${templateId}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update drill template');
            }

            const data = await response.json();
            toast.success('Drill template updated successfully');
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the template';
            setUpdateError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            try {
                const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
                if (BACKEND_URL) {
                    await fetch(`${BACKEND_URL}/drills/clear-cache/`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                    });
                }
            } catch (cacheError) {
                console.error("Failed to clear backend cache after template update:", cacheError);
            }
            setUpdateLoading(false);
        }
    };

    return {
        updateTemplate,
        updateLoading,
        updateError,
    };
}
