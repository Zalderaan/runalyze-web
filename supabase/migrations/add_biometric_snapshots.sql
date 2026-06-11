-- Migration: Add Biometric Snapshots and Audit Log tables

-- 1. Create biometric snapshots table
CREATE TABLE IF NOT EXISTS public.user_biometric_snapshots (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  height_cm    double precision CHECK (height_cm > 0),
  weight_kg    double precision CHECK (weight_kg > 0),
  bmi          numeric GENERATED ALWAYS AS (
                 CASE
                   WHEN height_cm > 0 AND weight_kg > 0
                   THEN ROUND((weight_kg / ((height_cm / 100.0) ^ 2))::numeric, 1)
                   ELSE NULL
                 END
               ) STORED,
  recorded_at  timestamp with time zone NOT NULL DEFAULT now(),
  notes        text,
  is_deleted   boolean NOT NULL DEFAULT false,
  deleted_at   timestamp with time zone,
  CONSTRAINT uq_bio_user_time UNIQUE (user_id, recorded_at)
);

CREATE INDEX IF NOT EXISTS idx_bio_user_time ON public.user_biometric_snapshots (user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_bio_active ON public.user_biometric_snapshots (user_id, recorded_at DESC) WHERE is_deleted = false;

-- 2. Create audit log table
CREATE TABLE IF NOT EXISTS public.user_stat_audit_log (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name     text NOT NULL CHECK (table_name IN ('user_biometric_snapshots', 'user_performance_snapshots')),
  snapshot_id    bigint NOT NULL,
  user_id        integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action         text NOT NULL CHECK (action IN ('created', 'edited', 'deleted', 'restored')),
  changed_fields jsonb,
  performed_at   timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON public.user_stat_audit_log (user_id, performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_snapshot ON public.user_stat_audit_log (table_name, snapshot_id);

-- 3. Create auditing trigger function
CREATE OR REPLACE FUNCTION public.trg_stat_audit()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  changed jsonb := '{}'::jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.user_stat_audit_log (table_name, snapshot_id, user_id, action, changed_fields)
    VALUES (TG_TABLE_NAME, NEW.id, NEW.user_id, 'created', to_jsonb(NEW));

  ELSIF TG_OP = 'UPDATE' THEN
    -- Diff logic
    IF TG_TABLE_NAME = 'user_biometric_snapshots' THEN
      IF OLD.height_cm IS DISTINCT FROM NEW.height_cm THEN
        changed := changed || jsonb_build_object('height_cm', jsonb_build_object('from', OLD.height_cm, 'to', NEW.height_cm));
      END IF;
      IF OLD.weight_kg IS DISTINCT FROM NEW.weight_kg THEN
        changed := changed || jsonb_build_object('weight_kg', jsonb_build_object('from', OLD.weight_kg, 'to', NEW.weight_kg));
      END IF;
      IF OLD.notes IS DISTINCT FROM NEW.notes THEN
        changed := changed || jsonb_build_object('notes', jsonb_build_object('from', OLD.notes, 'to', NEW.notes));
      END IF;
    ELSIF TG_TABLE_NAME = 'user_performance_snapshots' THEN
      IF OLD.time_3k_secs IS DISTINCT FROM NEW.time_3k_secs THEN
        changed := changed || jsonb_build_object('time_3k_secs', jsonb_build_object('from', OLD.time_3k_secs, 'to', NEW.time_3k_secs));
      END IF;
      IF OLD.time_5k_secs IS DISTINCT FROM NEW.time_5k_secs THEN
        changed := changed || jsonb_build_object('time_5k_secs', jsonb_build_object('from', OLD.time_5k_secs, 'to', NEW.time_5k_secs));
      END IF;
      IF OLD.time_10k_secs IS DISTINCT FROM NEW.time_10k_secs THEN
        changed := changed || jsonb_build_object('time_10k_secs', jsonb_build_object('from', OLD.time_10k_secs, 'to', NEW.time_10k_secs));
      END IF;
      IF OLD.notes IS DISTINCT FROM NEW.notes THEN
        changed := changed || jsonb_build_object('notes', jsonb_build_object('from', OLD.notes, 'to', NEW.notes));
      END IF;
    END IF;

    INSERT INTO public.user_stat_audit_log (table_name, snapshot_id, user_id, action, changed_fields)
    VALUES (
      TG_TABLE_NAME,
      NEW.id,
      NEW.user_id,
      CASE
        WHEN NEW.is_deleted AND NOT OLD.is_deleted THEN 'deleted'
        WHEN NOT NEW.is_deleted AND OLD.is_deleted THEN 'restored'
        ELSE 'edited'
      END,
      changed
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Create trigger on biometric snapshots
CREATE OR REPLACE TRIGGER bio_audit
AFTER INSERT OR UPDATE ON public.user_biometric_snapshots
FOR EACH ROW EXECUTE FUNCTION public.trg_stat_audit();

-- 5. Enable RLS
ALTER TABLE public.user_biometric_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stat_audit_log ENABLE ROW LEVEL SECURITY;

-- 6. Setup policies
CREATE POLICY "user_own_biometrics" ON public.user_biometric_snapshots
  FOR ALL TO authenticated USING (user_id = (SELECT auth.uid()::text::integer)); -- Or check auth.uid() type casting as integers are used in users table

CREATE POLICY "user_read_own_audit" ON public.user_stat_audit_log
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()::text::integer));

-- 7. Migrate existing height & weight from users table
INSERT INTO public.user_biometric_snapshots (user_id, height_cm, weight_kg, recorded_at, notes)
SELECT id, height_cm, weight_kg, created_at, 'Migrated initial values'
FROM public.users
WHERE height_cm IS NOT NULL OR weight_kg IS NOT NULL
ON CONFLICT DO NOTHING;
