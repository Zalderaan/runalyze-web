-- Add new status values to the enum type
-- Note: ALTER TYPE ... ADD VALUE cannot be executed in a transaction block in some Postgres versions.
-- If this fails, run the ADD VALUE commands individually in the SQL editor.
ALTER TYPE public.consultation_status ADD VALUE IF NOT EXISTS 'cancel-requested';
ALTER TYPE public.consultation_status ADD VALUE IF NOT EXISTS 'complete-requested';

-- Add columns to track who requested cancel/complete and per-party dismiss flags
ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS cancel_requested_by INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS complete_requested_by INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hidden_by_user BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hidden_by_coach BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS purge_after TIMESTAMPTZ DEFAULT NULL;

-- Migrate existing is_archived data:
UPDATE public.consultations SET hidden_by_user = true WHERE is_archived = true;
