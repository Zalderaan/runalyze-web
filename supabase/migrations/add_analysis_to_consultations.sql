-- Run this in your Supabase SQL Editor

ALTER TABLE public.consultations 
  ADD COLUMN IF NOT EXISTS analysis_id INTEGER REFERENCES public.analysis_results(id) ON DELETE SET NULL;
