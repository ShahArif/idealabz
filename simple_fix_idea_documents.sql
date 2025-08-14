-- Simple fix for idea_documents RLS policy issue
-- This script focuses specifically on allowing ideator users to save user research insights

-- Step 1: Ensure the idea_documents table exists with proper structure
CREATE TABLE IF NOT EXISTS public.idea_documents (
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

-- Step 2: Create a simple unique constraint that allows multiple documents of same type per idea
-- (This is needed for the upsert operation to work)
ALTER TABLE public.idea_documents 
DROP CONSTRAINT IF EXISTS idea_documents_idea_id_document_type_version_key;

-- Step 3: Enable RLS
ALTER TABLE public.idea_documents ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view idea documents" ON public.idea_documents;
DROP POLICY IF EXISTS "Users can create idea documents" ON public.idea_documents;
DROP POLICY IF EXISTS "Users can update idea documents" ON public.idea_documents;
DROP POLICY IF EXISTS "Users can delete idea documents" ON public.idea_documents;
DROP POLICY IF EXISTS "Allow authenticated users to view idea documents" ON public.idea_documents;
DROP POLICY IF EXISTS "Allow users to create documents for their own ideas" ON public.idea_documents;
DROP POLICY IF EXISTS "Allow users to update their own documents" ON public.idea_documents;
DROP POLICY IF EXISTS "Allow users to delete their own documents" ON public.idea_documents;

-- Step 5: Create the simplest possible RLS policies that will work
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

-- Step 6: Grant permissions
GRANT ALL ON public.idea_documents TO authenticated;

-- Step 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_idea_documents_idea_id ON public.idea_documents(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_documents_document_type ON public.idea_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_idea_documents_created_by ON public.idea_documents(created_by);

-- Step 8: Verify the setup
SELECT 
    'Current policies on idea_documents:' as info,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'idea_documents'
ORDER BY policyname;
