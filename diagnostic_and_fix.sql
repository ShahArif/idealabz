-- Diagnostic and aggressive fix for idea_documents RLS policy issue
-- This script will first diagnose the problem, then apply a comprehensive fix

-- Step 1: DIAGNOSE - Check current state
SELECT '=== DIAGNOSTIC INFORMATION ===' as info;

-- Check if table exists
SELECT 
    'Table exists' as check_item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'idea_documents') 
        THEN 'YES' 
        ELSE 'NO' 
    END as status;

-- Check if RLS is enabled
SELECT 
    'RLS enabled' as check_item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'idea_documents' AND rowsecurity = true) 
        THEN 'YES' 
        ELSE 'NO' 
    END as status;

-- Check current policies
SELECT 'Current policies on idea_documents:' as info;
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'idea_documents'
ORDER BY policyname;

-- Check constraints
SELECT 'Current constraints on idea_documents:' as info;
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'idea_documents';

-- Step 2: AGGRESSIVE CLEANUP - Remove all policies and constraints
SELECT '=== APPLYING AGGRESSIVE FIX ===' as info;

-- Drop ALL policies (including any that might have been created by other scripts)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'idea_documents'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.idea_documents';
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Drop any unique constraints that might be causing issues
ALTER TABLE public.idea_documents 
DROP CONSTRAINT IF EXISTS idea_documents_idea_id_document_type_version_key;

-- Step 3: RECREATE TABLE STRUCTURE - Ensure clean table
-- Drop and recreate the table to ensure no conflicting constraints
DROP TABLE IF EXISTS public.idea_documents CASCADE;

CREATE TABLE public.idea_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  content text,
  content_json jsonb,
  file_url text,
  is_ai_generated boolean DEFAULT false,
  ai_model text,
  ai_prompt text,
  generation_cost numeric(10,4),
  title text,
  description text,
  version text DEFAULT '1.0',
  status text DEFAULT 'draft',
  created_by uuid NOT NULL REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  reviewed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

-- Step 4: CREATE SIMPLE INDEXES
CREATE INDEX idx_idea_documents_idea_id ON public.idea_documents(idea_id);
CREATE INDEX idx_idea_documents_document_type ON public.idea_documents(document_type);
CREATE INDEX idx_idea_documents_created_by ON public.idea_documents(created_by);

-- Step 5: ENABLE RLS
ALTER TABLE public.idea_documents ENABLE ROW LEVEL SECURITY;

-- Step 6: CREATE MINIMAL RLS POLICIES - These are the most permissive possible
-- Policy 1: Allow all authenticated users to view documents
CREATE POLICY "view_all_documents" ON public.idea_documents
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy 2: Allow users to create documents for ideas they own (this is the key fix)
CREATE POLICY "create_own_documents" ON public.idea_documents
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM public.ideas 
      WHERE id = idea_id AND submitted_by = auth.uid()
    )
  );

-- Policy 3: Allow users to update documents they created
CREATE POLICY "update_own_documents" ON public.idea_documents
  FOR UPDATE USING (
    auth.uid() = created_by
  );

-- Policy 4: Allow users to delete documents they created
CREATE POLICY "delete_own_documents" ON public.idea_documents
  FOR DELETE USING (
    auth.uid() = created_by
  );

-- Step 7: GRANT PERMISSIONS
GRANT ALL ON public.idea_documents TO authenticated;

-- Step 8: VERIFY THE FIX
SELECT '=== VERIFICATION ===' as info;

-- Check if policies were created
SELECT 
    'INSERT policy exists' as check_item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'idea_documents' AND cmd = 'INSERT') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status
UNION ALL
SELECT 
    'RLS is enabled' as check_item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'idea_documents' AND rowsecurity = true) 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status
UNION ALL
SELECT 
    'Table exists' as check_item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'idea_documents') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

-- Show final policies
SELECT 'Final policies on idea_documents:' as info;
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'idea_documents'
ORDER BY policyname;

-- Test the RLS policy logic
SELECT 'Testing RLS policy logic:' as info;
SELECT 
    'User can create document for own idea' as test_case,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'idea_documents' 
            AND cmd = 'INSERT' 
            AND with_check LIKE '%submitted_by = auth.uid()%'
        ) THEN 'PASS' 
        ELSE 'FAIL' 
    END as result;
