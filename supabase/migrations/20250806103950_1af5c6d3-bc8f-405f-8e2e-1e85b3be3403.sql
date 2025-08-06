-- Fix RLS policies that may be causing violations
-- Update ideas table policies to be more specific and secure

-- Drop existing policies to recreate them more securely
DROP POLICY IF EXISTS "All authenticated users can view ideas" ON public.ideas;
DROP POLICY IF EXISTS "Authenticated users can insert ideas" ON public.ideas;

-- Create more secure view policy
CREATE POLICY "Authenticated users can view ideas"
ON public.ideas
FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');

-- Create more secure insert policy with proper user validation
CREATE POLICY "Users can insert their own ideas"
ON public.ideas
FOR INSERT
TO authenticated
WITH CHECK (
  auth.role() = 'authenticated' 
  AND auth.uid() = submitted_by
  AND auth.uid() IS NOT NULL
);

-- Add audit logging for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name text NOT NULL,
  operation text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'super_admin');

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (table_name, operation, user_id, old_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (table_name, operation, user_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (table_name, operation, user_id, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;