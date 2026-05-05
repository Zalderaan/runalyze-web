import { useQuery } from "@tanstack/react-query";
import { Consultation } from "@/components/consultations/ConsultationTable";  // Import your interface
import { useAuth } from "@/context/user_context";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

    useEffect(() => {
        if (!user?.id) return;

        const isCoach = user.user_role === 'admin';

        const channel = supabase
            .channel('consultations-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'consultations',
                    // Filter by the current user's role and ID to only get relevant updates
                    filter: isCoach ? `coach_id=eq.${user.id}` : `user_id=eq.${user.id}`
                },
                (payload) => {
                    console.log('Consultation change received:', payload);
                    query.refetch();

                    // Notify coach about new incoming requests
                    if (isCoach && payload.eventType === 'INSERT') {
                        toast.info('New consultation request received!', {
                            description: 'A new user is looking for your advice.',
                            duration: 5000,
                        });
                    }

                    if (payload.eventType === 'UPDATE') {
                        const oldStatus = (payload.old as any).status;
                        const newStatus = (payload.new as any).status;
                        if (oldStatus !== newStatus) {
                            const messages: Record<string, string> = {
                                'cancel-requested': 'A cancellation has been requested. Please review.',
                                'complete-requested': 'A completion has been requested. Please confirm.',
                                'cancelled': 'Consultation has been cancelled.',
                                'completed': 'Consultation has been marked as complete!',
                                'in-progress': 'Consultation is back in progress.',
                            };
                            const desc = messages[newStatus] || `Status updated to ${newStatus}.`;
                            toast.info('Consultation Update', {
                                description: desc,
                                duration: 5000,
                            });
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, user?.user_role, query]);

    return {
        consultations: query.data || [],
        consultationsLoading: query.isLoading,
        consultationsError: query.error,
        refetchConsultations: query.refetch,
    };
}