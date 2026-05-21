import { useState } from 'react';
import { toast } from 'sonner';

export function useDeleteDrillTemplate() {
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const deleteTemplate = async (templateId: number | string) => {
        setDeleteLoading(true);
        setDeleteError(null);

        try {
            const response = await fetch(`/api/admin/drill-templates/${templateId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete drill template');
            }

            toast.success('Drill template deleted successfully');
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the template';
            setDeleteError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setDeleteLoading(false);
        }
    };

    return {
        deleteTemplate,
        deleteLoading,
        deleteError,
    };
}
