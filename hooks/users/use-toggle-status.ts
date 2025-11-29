'use client'

import { useState } from "react";

export function useToggleStatus() {
    const [isStatusUpdating, setIsStatusUpdating] = useState(false);
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

    async function updateAdminStatus(id: number | string, isActive: boolean) {
        try {
            setIsStatusUpdating(true);
            setStatusUpdateError(null);
            const res = await fetch(`/api/user/${id}/toggle-status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: isActive }),  // Changed from 'status' to 'is_active'
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to update status");
            }
            return true;
        } catch (updateError: any) {
            setStatusUpdateError(updateError.message || "Unknown error");
            return false;
        } finally {
            setIsStatusUpdating(false);
        }
    }

    return {
        updateAdminStatus,
        isStatusUpdating,
        statusUpdateError
    }
}