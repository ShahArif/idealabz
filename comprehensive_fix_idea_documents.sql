-- Comprehensive fix for idea_documents table and RLS policies
-- This script will diagnose and fix all issues with the idea_documents table

-- Step 1: Check if idea_documents table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'idea_documents') THEN
        RAISE NOTICE 'Creating idea_documents table...';
        
        -- Create the idea_documents table
        CREATE TABLE public.idea_documents (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          idea_id uuid NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
          
          -- Document type and metadata
          document_type text NOT NULL,
          
          -- Document content (can be text, JSON, or file reference)
          content text,
          content_json jsonb,
          file_url text,
          
          -- AI generation metadata
          is_ai_generated boolean DEFAULT false,
          ai_model text,
          ai_prompt text,
          generation_cost numeric(10,4),
          
          -- Document metadata
          title text,
          description text,
          version text DEFAULT '1.0',
          status text DEFAULT 'draft',
          
          -- User tracking
          created_by uuid NOT NULL REFERENCES auth.users(id),
          updated_by uuid REFERENCES auth.users(id),
          reviewed_by uuid REFERENCES auth.users(id),
          
          -- Timestamps
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          reviewed_at timestamptz,
          
          -- Unique constraint to prevent duplicate documents of same type per idea
          UNIQUE(idea_id, document_type, version)
        );
        
        -- Create indexes for better performance
        CREATE INDEX idx_idea_documents_idea_id ON public.idea_documents(idea_id);
        CREATE INDEX idx_idea_documents_document_type ON public.idea_documents(document_type);
        CREATE INDEX idx_idea_documents_created_by ON public.idea_documents(created_by);
        CREATE INDEX idx_idea_documents_status ON public.idea_documents(status);
        CREATE INDEX idx_idea_documents_created_at ON public.idea_documents(created_at);
        
        RAISE NOTICE 'idea_documents table created successfully';
    ELSE
        RAISE NOTICE 'idea_documents table already exists';
    END IF;
END $$;

-- Step 2: Drop all existing RLS policies on idea_documents to start fresh
DROP POLICY IF EXISTS "Users can view idea documents" ON public.idea_documents;
DROP POLICY IF EXISTS "Users can create idea documents" ON public.idea_documents;
DROP POLICY IF EXISTS "Users can update idea documents" ON public.idea_documents;
DROP POLICY IF EXISTS "Users can delete idea documents" ON public.idea_documents;

-- Step 3: Enable RLS on idea_documents table
ALTER TABLE public.idea_documents ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, permissive RLS policies that will definitely work
-- Policy 1: Allow all authenticated users to view documents
CREATE POLICY "Allow authenticated users to view idea documents" ON public.idea_documents
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy 2: Allow users to create documents for ideas they own (this is the key fix)
CREATE POLICY "Allow users to create documents for their own ideas" ON public.idea_documents
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM public.ideas 
      WHERE id = idea_id AND submitted_by = auth.uid()
    )
  );

-- Policy 3: Allow users to update documents they created
CREATE POLICY "Allow users to update their own documents" ON public.idea_documents
  FOR UPDATE USING (
    auth.uid() = created_by
  );

-- Policy 4: Allow users to delete documents they created
CREATE POLICY "Allow users to delete their own documents" ON public.idea_documents
  FOR DELETE USING (
    auth.uid() = created_by
  );

-- Step 5: Create trigger to maintain updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_idea_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_idea_documents_updated_at ON public.idea_documents;
CREATE TRIGGER update_idea_documents_updated_at
  BEFORE UPDATE ON public.idea_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_idea_documents_updated_at();

-- Step 6: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.idea_documents TO authenticated;

-- Step 7: Verify the setup
DO $$
BEGIN
    RAISE NOTICE 'Verifying RLS policies...';
    
    -- Check if policies exist
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'idea_documents' 
        AND policyname = 'Allow users to create documents for their own ideas'
    ) THEN
        RAISE NOTICE '✓ INSERT policy created successfully';
    ELSE
        RAISE NOTICE '✗ INSERT policy creation failed';
    END IF;
    
    -- Check if RLS is enabled
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'idea_documents' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✓ RLS is enabled on idea_documents table';
    ELSE
        RAISE NOTICE '✗ RLS is not enabled on idea_documents table';
    END IF;
    
END $$;

-- Step 8: Show current policies for verification
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename = 'idea_documents'
ORDER BY policyname;

-- Step 9: Test the setup with a simple query
SELECT 
    'idea_documents table exists' as check_item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'idea_documents') 
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
    'INSERT policy exists' as check_item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'idea_documents' AND cmd = 'INSERT') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;
