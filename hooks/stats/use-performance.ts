import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PerformanceSnapshot, PerformancePayload, AuditEntry, PersonalBests } from "@/lib/stats/types";
import { useAuth } from "@/context/user_context";

export function useGetPerformance(includeDeleted = false) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["performance", user?.id, { includeDeleted }],
    queryFn: async (): Promise<PerformanceSnapshot[]> => {
      const response = await fetch(`/api/stats/performance?include_deleted=${includeDeleted}`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch performance history");
      }
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePerformance() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: PerformancePayload): Promise<PerformanceSnapshot> => {
      const response = await fetch("/api/stats/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to log performance");
      }
      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["personal-bests", user?.id] });
    },
  });
}

export function useEditPerformance() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<PerformancePayload> & { is_deleted?: boolean } }): Promise<PerformanceSnapshot> => {
      const response = await fetch(`/api/stats/performance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update performance snapshot");
      }
      const data = await response.json();
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["performance", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["performance-audit", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["personal-bests", user?.id] });
    },
  });
}

export function useDeletePerformance() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await fetch(`/api/stats/performance/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete performance snapshot");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["personal-bests", user?.id] });
    },
  });
}

export function useGetPersonalBests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["personal-bests", user?.id],
    queryFn: async (): Promise<PersonalBests> => {
      const response = await fetch("/api/stats/performance/personal-bests", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch personal bests");
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetPerformanceAudit(snapshotId: number, enabled = true) {
  return useQuery({
    queryKey: ["performance-audit", snapshotId],
    queryFn: async (): Promise<AuditEntry[]> => {
      const response = await fetch(`/api/stats/performance/${snapshotId}/audit`, {
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
