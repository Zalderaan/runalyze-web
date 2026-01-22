'use client'

import { ConsultationTable } from "@/components/consultations/ConsultationTable";
import { useDeleteConsultation } from "@/hooks/consultation/use-delete-consultation";
import { useGetConsultations } from "@/hooks/consultation/use-get-consultations";
import { useUpdateConsultation } from "@/hooks/consultation/use-update-consultation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ConsultationPage() {
    const { consultations, consultationsError, consultationsLoading, refetchConsultations } = useGetConsultations();
    const { updateStatus, updateStatusAsync, isUpdatingStatus, isUpdateStatusError, updateStatusError } = useUpdateConsultation();
    const { deleteConsultation, isDeleting, isDeleteError, deleteError } = useDeleteConsultation();

    return (
        <>
            <ConsultationTable
                consultations={consultations}
                onUpdateStatus={(id, status, is_archived) => updateStatus({ id, status, is_archived })}
                onArchiveConsultation={deleteConsultation}
                isLoading={consultationsLoading}
            />
        </>
    )
}