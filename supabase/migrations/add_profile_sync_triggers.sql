-- Migration: Add bidirectional sync triggers between users and snapshots

-- 1. Create function to sync from users to snapshots
CREATE OR REPLACE FUNCTION public.trg_users_to_snapshots_sync()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- Sync to biometrics if height or weight changes
  IF (TG_OP = 'UPDATE' AND (OLD.height_cm IS DISTINCT FROM NEW.height_cm OR OLD.weight_kg IS DISTINCT FROM NEW.weight_kg))
     OR (TG_OP = 'INSERT' AND (NEW.height_cm IS NOT NULL OR NEW.weight_kg IS NOT NULL)) THEN
    INSERT INTO public.user_biometric_snapshots (user_id, height_cm, weight_kg, recorded_at, notes)
    VALUES (NEW.id, NEW.height_cm, NEW.weight_kg, now(), 'Sync from profile edit')
    ON CONFLICT (user_id, recorded_at) DO UPDATE
    SET height_cm = EXCLUDED.height_cm,
        weight_kg = EXCLUDED.weight_kg;
  END IF;

  -- Sync to performance if best times change
  IF (TG_OP = 'UPDATE' AND (OLD.time_3k IS DISTINCT FROM NEW.time_3k OR OLD.time_5k IS DISTINCT FROM NEW.time_5k OR OLD.time_10k IS DISTINCT FROM NEW.time_10k))
     OR (TG_OP = 'INSERT' AND (NEW.time_3k IS NOT NULL OR NEW.time_5k IS NOT NULL OR NEW.time_10k IS NOT NULL)) THEN
    INSERT INTO public.user_performance_snapshots (user_id, time_3k_secs, time_5k_secs, time_10k_secs, recorded_at, notes)
    VALUES (NEW.id, NEW.time_3k, NEW.time_5k, NEW.time_10k, now(), 'Sync from profile edit')
    ON CONFLICT (user_id, recorded_at) DO UPDATE
    SET time_3k_secs = EXCLUDED.time_3k_secs,
        time_5k_secs = EXCLUDED.time_5k_secs,
        time_10k_secs = EXCLUDED.time_10k_secs;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Attach trigger to users table
CREATE OR REPLACE TRIGGER users_to_snapshots_sync_trigger
AFTER INSERT OR UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.trg_users_to_snapshots_sync();

-- 3. Create function to sync from snapshots back to users (to avoid breaking legacy code)
CREATE OR REPLACE FUNCTION public.trg_snapshots_to_users_sync()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  latest_height double precision;
  latest_weight double precision;
  latest_3k numeric;
  latest_5k numeric;
  latest_10k numeric;
BEGIN
  -- Prevent trigger recursion recursion
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'user_biometric_snapshots' THEN
    -- Get latest active biometrics values
    SELECT height_cm, weight_kg INTO latest_height, latest_weight
    FROM public.user_biometric_snapshots
    WHERE user_id = NEW.user_id AND is_deleted = false
    ORDER BY recorded_at DESC, id DESC
    LIMIT 1;

    -- Update users table
    UPDATE public.users
    SET height_cm = latest_height,
        weight_kg = latest_weight
    WHERE id = NEW.user_id;

  ELSIF TG_TABLE_NAME = 'user_performance_snapshots' THEN
    -- Get latest active performance values
    SELECT time_3k_secs, time_5k_secs, time_10k_secs INTO latest_3k, latest_5k, latest_10k
    FROM public.user_performance_snapshots
    WHERE user_id = NEW.user_id AND is_deleted = false
    ORDER BY recorded_at DESC, id DESC
    LIMIT 1;

    -- Update users table
    UPDATE public.users
    SET time_3k = latest_3k,
        time_5k = latest_5k,
        time_10k = latest_10k
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Attach trigger to biometric snapshots
CREATE OR REPLACE TRIGGER snapshots_to_users_bio_sync_trigger
AFTER INSERT OR UPDATE ON public.user_biometric_snapshots
FOR EACH ROW EXECUTE FUNCTION public.trg_snapshots_to_users_sync();

-- 5. Attach trigger to performance snapshots
CREATE OR REPLACE TRIGGER snapshots_to_users_perf_sync_trigger
AFTER INSERT OR UPDATE ON public.user_performance_snapshots
FOR EACH ROW EXECUTE FUNCTION public.trg_snapshots_to_users_sync();
