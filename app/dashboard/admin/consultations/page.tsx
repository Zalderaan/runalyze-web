'use client'

import { ConsultationTable } from "@/components/consultations/ConsultationTable";
import { useGetConsultations } from "@/hooks/consultation/use-get-consultations";
import { useUpdateConsultation } from "@/hooks/consultation/use-update-consultation";
import { toast } from "sonner";

export default function ConsultationPage() {
    const { consultations, consultationsLoading, refetchConsultations } = useGetConsultations();
    const { updateStatus } = useUpdateConsultation();

    const handleDismiss = async (id: string) => {
        try {
            const response = await fetch(`/api/consult/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dismiss: true }),
            });
            if (response.ok) {
                toast.success('Consultation dismissed.');
                refetchConsultations();
            } else {
                const err = await response.json();
                toast.error(err.message || 'Failed to dismiss.');
            }
        } catch (error) {
            console.error('Error dismissing:', error);
            toast.error('An error occurred.');
        }
    };

    return (
        <ConsultationTable
            consultations={consultations}
            onUpdateStatus={(id, status) => updateStatus({ id, status })}
            onDismiss={handleDismiss}
            isLoading={consultationsLoading}
        />
    )
}