-- Add new roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'leader';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'tech_expert';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'product_expert';