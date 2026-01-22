import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

export function useDeleteConsultation() {
    const queryClient = useQueryClient();

    const deleteConsultationMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/consult/${id}`, {
                method: "DELETE",
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete consultation');
            }
            return response.json();
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consultations'] });
            toast.success('Consultation deleted successfully!');  // Add success toast
        },

        onError: (error) => {
            toast.error("Error logging in", {
                description: `${error.message}`,
                duration: 3000,
                classNames: {
                    title: "!text-red-900",
                    description: "!text-xs !text-red-700",
                    toast: "!bg-red-200 !border-red-300",
                }
            })
        }
    })

    return {
        deleteConsultation: deleteConsultationMutation.mutate,
        deleteConsultationAsync: deleteConsultationMutation.mutateAsync,
        isDeleting: deleteConsultationMutation.isPending,
        isDeleteError: deleteConsultationMutation.isError,
        deleteError: deleteConsultationMutation.error,
    };
}