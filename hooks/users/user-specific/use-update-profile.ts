'use client'

import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface UpdateProfileData {
    height_cm: number | null;
    weight_kg: number | null;
    time_3k: string | null;
    time_5k: string | null;
    time_10k: string | null;
}

export function useUpdateProfile(userId: string | number) {
    const queryClient = useQueryClient();

    const updateProfileMutation = useMutation({
        mutationFn: async (data: UpdateProfileData) => {
            const response = await fetch(`/api/user/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update profile");
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate and refetch user data
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
        },
    });

    return {
        updateProfile: updateProfileMutation.mutate,
        updateProfileAsync: updateProfileMutation.mutateAsync,
        isUpdatingProfile: updateProfileMutation.isPending,
        updateProfileError: updateProfileMutation.error
    }
}