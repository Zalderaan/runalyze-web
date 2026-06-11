export interface BiometricSnapshot {
  id: number;
  user_id: number;
  height_cm: number | null;
  weight_kg: number | null;
  bmi: number | null;
  recorded_at: string;
  notes: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
}

export interface PerformanceSnapshot {
  id: number;
  user_id: number;
  time_3k_secs: number | null;
  time_5k_secs: number | null;
  time_10k_secs: number | null;
  time_3k?: string | null;   // Formatted MM:SS or HH:MM:SS (injected by API)
  time_5k?: string | null;
  time_10k?: string | null;
  recorded_at: string;
  notes: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
}

export interface AuditEntry {
  id: number;
  table_name: 'user_biometric_snapshots' | 'user_performance_snapshots';
  snapshot_id: number;
  user_id: number;
  action: 'created' | 'edited' | 'deleted' | 'restored';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changed_fields: Record<string, { from: any; to: any }> | null;
  performed_at: string;
}

export interface BiometricPayload {
  height_cm?: number;
  weight_kg?: number;
  recorded_at?: string;
  notes?: string;
}

export interface PerformancePayload {
  time_3k?: string;
  time_5k?: string;
  time_10k?: string;
  recorded_at?: string;
  notes?: string;
}

export interface PersonalBests {
  time_3k: number | null;
  time_5k: number | null;
  time_10k: number | null;
  time_3k_formatted?: string | null;
  time_5k_formatted?: string | null;
  time_10k_formatted?: string | null;
}
