-- Fix RLS policy for idea_documents table to allow ideator (employee) users to create documents
-- This fixes the error: "new row violates row-level security policy for table 'idea_documents'"

-- First, add missing document types that the application is trying to use
ALTER TABLE public.idea_documents 
DROP CONSTRAINT IF EXISTS idea_documents_document_type_check;

ALTER TABLE public.idea_documents 
ADD CONSTRAINT idea_documents_document_type_check 
CHECK (document_type IN (
  'prd_one_pager',
  'prd_full',
  'market_research',
  'competitor_analysis',
  'user_research',
  'user_research_insights',  -- Add this missing type
  'user_pains',              -- Add this missing type
  'tech_feasibility',
  'leadership_pitch',
  'mvp_plan',
  'financial_analysis',
  'risk_assessment',
  'go_to_market',
  'ideation_frameworks',     -- Add this for future use
  'framework_implementation', -- Add this for future use
  'other'
));

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can create idea documents" ON public.idea_documents;

-- Create a new, more permissive INSERT policy that allows ideator (employee) users to create documents
CREATE POLICY "Users can create idea documents" ON public.idea_documents
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' 
    AND (
      -- User owns the idea (this should work for ideator/employee users)
      EXISTS (
        SELECT 1 FROM public.ideas 
        WHERE id = idea_id AND submitted_by = auth.uid()
      )
      OR
      -- User is admin, core team, or mentor
      public.is_core_team_or_admin(auth.uid())
      OR
      -- User has specific role permissions
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'idealabs_core_team', 'idea_mentor')
      )
      OR
      -- Allow employee (ideator) users to create documents for ideas they own
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'employee'
      )
    )
  );

-- Also update the UPDATE policy to be more permissive for ideator users
DROP POLICY IF EXISTS "Users can update idea documents" ON public.idea_documents;

CREATE POLICY "Users can update idea documents" ON public.idea_documents
  FOR UPDATE USING (
    auth.uid() = created_by 
    OR public.is_core_team_or_admin(auth.uid())
    OR
    -- Allow employee (ideator) users to update documents they created
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'employee'
    )
  );

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'idea_documents';

-- Show the updated document type constraints
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'idea_documents' AND column_name = 'document_type';
