-- Add thumbnail_url column to drill_templates and drills tables
ALTER TABLE public.drill_templates 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

ALTER TABLE public.drills 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
