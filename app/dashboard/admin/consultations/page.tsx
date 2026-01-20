'use client'

import { ConsultationTable } from "@/components/consultations/ConsultationTable";
import { useGetConsultations } from "@/hooks/consultation/use-get-consultations";
import { useUpdateConsultation } from "@/hooks/consultation/use-update-consultation";

export default function ConsultationPage() {
    const { consultations, consultationsError, consultationsLoading, refetchConsultations } = useGetConsultations();
    const { updateStatus, updateStatusAsync, isUpdatingStatus, isUpdateStatusError, updateStatusError } = useUpdateConsultation();

    return (
        <>
            <ConsultationTable
                consultations={consultations}
                onUpdateStatus={(id, status) => updateStatus({ id, status })}
                isLoading={consultationsLoading}
            />
        </>
    )
}