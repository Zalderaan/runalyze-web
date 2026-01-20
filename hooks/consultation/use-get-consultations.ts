import { useQuery } from "@tanstack/react-query";
import { Consultation } from "@/components/consultations/ConsultationTable";  // Import your interface
import { useAuth } from "@/context/user_context";

export function useGetConsultations() {
    const { user } = useAuth();

    const query = useQuery({
        queryKey: ["consultations", user?.id],  // Unique key for caching
        queryFn: async (): Promise<Consultation[]> => {
            const response = await fetch("/api/consult", {
                method: "GET",
                credentials: "include",  // Include cookies for authentication
            });
            if (!response.ok) {
                throw new Error("Failed to fetch consultations");
            }
            const data = await response.json();
            return data.consultations;  // Assuming API returns { consultations: Consultation[] }
        },
        staleTime: 5 * 60 * 1000,  // Cache for 5 minutes
        refetchOnWindowFocus: false,  // Optional: disable refetch on focus
    });

    return {
        consultations: query.data || [],
        consultationsLoading: query.isLoading,
        consultationsError: query.error,
        refetchConsultations: query.refetch,
    };
}