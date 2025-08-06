-- Add new roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'leader';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'tech_expert';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'product_expert';

-- Update idea_stage enum to include all workflow stages
ALTER TYPE public.idea_stage ADD VALUE IF NOT EXISTS 'basic_validation';
ALTER TYPE public.idea_stage ADD VALUE IF NOT EXISTS 'tech_validation';
ALTER TYPE public.idea_stage ADD VALUE IF NOT EXISTS 'leadership_pitch';
ALTER TYPE public.idea_stage ADD VALUE IF NOT EXISTS 'mvp';
ALTER TYPE public.idea_stage ADD VALUE IF NOT EXISTS 'rejected';

-- Create function to check if user can manage stage
CREATE OR REPLACE FUNCTION public.can_manage_stage(_user_id uuid, _stage idea_stage)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT CASE 
    WHEN _stage IN ('discovery', 'basic_validation') THEN 
      EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role = 'product_expert')
    WHEN _stage = 'tech_validation' THEN 
      EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role = 'tech_expert')
    WHEN _stage = 'leadership_pitch' THEN 
      EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role = 'leader')
    WHEN _stage = 'mvp' THEN 
      EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role IN ('leader', 'super_admin'))
    ELSE false
  END;
$function$;

-- Update RLS policies for ideas table to use new role system
DROP POLICY IF EXISTS "Core team can update idea stages" ON public.ideas;

CREATE POLICY "Role-based stage management" 
ON public.ideas 
FOR UPDATE 
USING (can_manage_stage(auth.uid(), stage) OR get_user_role(auth.uid()) = 'super_admin');

-- Create function to get next stage based on current stage and action
CREATE OR REPLACE FUNCTION public.get_next_stage(_current_stage idea_stage, _action text)
RETURNS idea_stage
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT CASE 
    WHEN _current_stage = 'discovery' AND _action = 'accept' THEN 'basic_validation'::idea_stage
    WHEN _current_stage = 'discovery' AND _action = 'reject' THEN 'rejected'::idea_stage
    WHEN _current_stage = 'basic_validation' AND _action = 'accept' THEN 'tech_validation'::idea_stage
    WHEN _current_stage = 'basic_validation' AND _action = 'reject' THEN 'rejected'::idea_stage
    WHEN _current_stage = 'tech_validation' AND _action = 'accept' THEN 'leadership_pitch'::idea_stage
    WHEN _current_stage = 'tech_validation' AND _action = 'reject' THEN 'rejected'::idea_stage
    WHEN _current_stage = 'leadership_pitch' AND _action = 'approve' THEN 'mvp'::idea_stage
    WHEN _current_stage = 'leadership_pitch' AND _action = 'reject' THEN 'rejected'::idea_stage
    WHEN _current_stage = 'leadership_pitch' AND _action = 'request_more_info' THEN 'basic_validation'::idea_stage
    ELSE _current_stage
  END;
$function$;