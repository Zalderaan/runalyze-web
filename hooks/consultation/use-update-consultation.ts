import { ConsultationStatus } from "@/components/consultations/ConsultationTable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


export function useUpdateConsultation() {

    const queryClient = useQueryClient();
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status, is_archived }: { id: string; status: ConsultationStatus, is_archived?: boolean }) => {
            const response = await fetch(`/api/consult/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status, is_archived }),
            });
            if (!response.ok) throw new Error('Failed to update status');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consultations'] });
            toast.success('Status updated successfully');
            // setDialogOpen(false);
            // setSelectedConsultation(null);
        },
        onError: (error) => {
            toast.error('Failed to update status: ' + error.message);
        },
    });

    return {
        updateStatus: updateStatusMutation.mutate,
        updateStatusAsync: updateStatusMutation.mutateAsync,
        isUpdatingStatus: updateStatusMutation.isPending,
        updateStatusError: updateStatusMutation.error,
        isUpdateStatusError: updateStatusMutation.isError,
    }
}

