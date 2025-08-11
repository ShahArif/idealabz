-- Fix the missing INSERT policy for profiles table
-- This allows the handle_new_user trigger to create profile records

-- Add INSERT policy for profiles table
CREATE POLICY "Allow trigger function to insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- Also ensure the trigger function has proper permissions
-- The function is already SECURITY DEFINER, but let's make sure it can bypass RLS
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
