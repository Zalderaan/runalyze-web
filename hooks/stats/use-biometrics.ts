import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BiometricSnapshot, BiometricPayload, AuditEntry } from "@/lib/stats/types";
import { useAuth } from "@/context/user_context";

export function useGetBiometrics(includeDeleted = false) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["biometrics", user?.id, { includeDeleted }],
    queryFn: async (): Promise<BiometricSnapshot[]> => {
      const response = await fetch(`/api/stats/biometrics?include_deleted=${includeDeleted}`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch biometric history");
      }
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBiometric() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: BiometricPayload): Promise<BiometricSnapshot> => {
      const response = await fetch("/api/stats/biometrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to log biometrics");
      }
      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biometrics", user?.id] });
    },
  });
}

export function useEditBiometric() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<BiometricPayload> & { is_deleted?: boolean } }): Promise<BiometricSnapshot> => {
      const response = await fetch(`/api/stats/biometrics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update biometric snapshot");
      }
      const data = await response.json();
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["biometrics", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["biometric-audit", variables.id] });
    },
  });
}

export function useDeleteBiometric() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await fetch(`/api/stats/biometrics/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete biometric snapshot");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biometrics", user?.id] });
    },
  });
}

export function useGetBiometricAudit(snapshotId: number, enabled = true) {
  return useQuery({
    queryKey: ["biometric-audit", snapshotId],
    queryFn: async (): Promise<AuditEntry[]> => {
      const response = await fetch(`/api/stats/biometrics/${snapshotId}/audit`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch audit log");
      }
      const data = await response.json();
      return data.data || [];
    },
    enabled: enabled && !!snapshotId,
    staleTime: 60 * 1000,
  });
}
