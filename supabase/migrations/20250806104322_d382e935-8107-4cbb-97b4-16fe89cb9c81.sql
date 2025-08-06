-- Fix the RLS policy roles for stage management
-- The issue is that the policy is set to 'public' role instead of 'authenticated'

DROP POLICY IF EXISTS "Role-based stage management" ON public.ideas;

-- Recreate with correct role targeting
CREATE POLICY "Role-based stage management"
ON public.ideas
FOR UPDATE
TO authenticated
USING (can_manage_stage(auth.uid(), stage) OR (get_user_role(auth.uid()) = 'super_admin'::app_role));

-- Also ensure the "Users can update own ideas" policy targets authenticated users
DROP POLICY IF EXISTS "Users can update own ideas" ON public.ideas;

CREATE POLICY "Users can update own ideas"
ON public.ideas
FOR UPDATE
TO authenticated
USING (auth.uid() = submitted_by);