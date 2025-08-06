-- Update idea_stage enum to include all workflow stages
ALTER TYPE public.idea_stage ADD VALUE IF NOT EXISTS 'basic_validation';
ALTER TYPE public.idea_stage ADD VALUE IF NOT EXISTS 'tech_validation';
ALTER TYPE public.idea_stage ADD VALUE IF NOT EXISTS 'leadership_pitch';
ALTER TYPE public.idea_stage ADD VALUE IF NOT EXISTS 'mvp';
ALTER TYPE public.idea_stage ADD VALUE IF NOT EXISTS 'rejected';