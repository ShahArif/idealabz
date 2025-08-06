-- Add target_audience field to ideas table for "Who will use it?" question
ALTER TABLE public.ideas ADD COLUMN target_audience TEXT;