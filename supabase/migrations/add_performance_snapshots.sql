-- Migration: Add Performance Snapshots table and trigger

-- 1. Create performance snapshots table
CREATE TABLE IF NOT EXISTS public.user_performance_snapshots (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  time_3k_secs  integer CHECK (time_3k_secs > 0),
  time_5k_secs  integer CHECK (time_5k_secs > 0),
  time_10k_secs integer CHECK (time_10k_secs > 0),
  recorded_at   timestamp with time zone NOT NULL DEFAULT now(),
  notes         text,
  is_deleted    boolean NOT NULL DEFAULT false,
  deleted_at    timestamp with time zone,
  CONSTRAINT uq_perf_user_time UNIQUE (user_id, recorded_at),
  CONSTRAINT chk_at_least_one_time CHECK (
    time_3k_secs IS NOT NULL OR
    time_5k_secs IS NOT NULL OR
    time_10k_secs IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_perf_user_time ON public.user_performance_snapshots (user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_perf_active ON public.user_performance_snapshots (user_id, recorded_at DESC) WHERE is_deleted = false;

-- 2. Create trigger on performance snapshots
CREATE OR REPLACE TRIGGER perf_audit
AFTER INSERT OR UPDATE ON public.user_performance_snapshots
FOR EACH ROW EXECUTE FUNCTION public.trg_stat_audit();

-- 3. Migrate existing best times from users table
INSERT INTO public.user_performance_snapshots (user_id, time_3k_secs, time_5k_secs, time_10k_secs, recorded_at, notes)
SELECT id, time_3k, time_5k, time_10k, created_at, 'Migrated initial values'
FROM public.users
WHERE time_3k IS NOT NULL OR time_5k IS NOT NULL OR time_10k IS NOT NULL
ON CONFLICT DO NOTHING;
