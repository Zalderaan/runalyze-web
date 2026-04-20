-- ============================================================
-- DRILL SYSTEM NORMALIZATION MIGRATION
-- Run this in Supabase SQL Editor before deploying code changes.
-- ============================================================

-- 1. Create drill_templates table
-- NOTE: difficulty_level and is_high_impact are per-assignment fields (stay on drills)
CREATE TABLE IF NOT EXISTS public.drill_templates (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  video_url text,
  instructions jsonb,
  justification text,
  reference text,
  helpful_count bigint DEFAULT 0,
  not_helpful_count bigint DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Migrate unique drills (by name) into drill_templates
-- Uses the first occurrence of each drill_name for the video/instructions/justification
INSERT INTO public.drill_templates (name, video_url, instructions, justification, reference, helpful_count, not_helpful_count, created_at)
SELECT
  drill_name,
  video_url,
  instructions,
  justification,
  reference,
  COALESCE(sum_helpful, 0),
  COALESCE(sum_not_helpful, 0),
  first_created
FROM (
  SELECT DISTINCT ON (drill_name)
    drill_name,
    video_url,
    instructions,
    justification,
    reference,
    SUM(helpful_count) OVER (PARTITION BY drill_name) AS sum_helpful,
    SUM(not_helpful_count) OVER (PARTITION BY drill_name) AS sum_not_helpful,
    MIN(created_at) OVER (PARTITION BY drill_name) AS first_created
  FROM public.drills
  ORDER BY drill_name, created_at ASC
) sub;

-- 3. Add new columns to the drills table
ALTER TABLE public.drills
  ADD COLUMN IF NOT EXISTS template_id bigint REFERENCES public.drill_templates(id),
  ADD COLUMN IF NOT EXISTS instructions_override jsonb,
  ADD COLUMN IF NOT EXISTS justification_override text;

-- 4. Populate template_id on all existing drills rows by matching names
UPDATE public.drills d
SET template_id = dt.id
FROM public.drill_templates dt
WHERE d.drill_name = dt.name;

-- 5. Verification queries (run to confirm migration succeeded)
-- SELECT COUNT(*) FROM public.drill_templates;
-- SELECT id, template_id, drill_name, area, performance_level FROM public.drills LIMIT 20;
