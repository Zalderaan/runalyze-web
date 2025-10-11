'use client'

import { useState } from "react";

export function useUpdateRole() {
    const [isRoleUpdating, setIsRoleUpdating] = useState(false);
    const [roleUpdateError, setRoleUpdateError] = useState<string | null>(null);

    async function updateUserRole(id: number | string, role: "admin" | "user") {
        try {
            setIsRoleUpdating(true);
            setRoleUpdateError(null);
            const res = await fetch(`/api/user/${id}/role`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to update role");
            }
        } catch (updateError: any) {
            setRoleUpdateError(updateError.message || "Unknown error");
        } finally {
            setIsRoleUpdating(false);
        }
    }

    return {
        updateUserRole,
        isRoleUpdating,
        roleUpdateError
    }
}