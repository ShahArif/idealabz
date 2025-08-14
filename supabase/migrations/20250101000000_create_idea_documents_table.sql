-- Create comprehensive table to store all idea-related documents and research
CREATE TABLE IF NOT EXISTS public.idea_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  
  -- Document type and metadata
  document_type text NOT NULL CHECK (document_type IN (
    'prd_one_pager',
    'prd_full',
    'market_research',
    'competitor_analysis',
    'user_research',
    'tech_feasibility',
    'leadership_pitch',
    'mvp_plan',
    'financial_analysis',
    'risk_assessment',
    'go_to_market',
    'other'
  )),
  
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
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'archived')),
  
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

-- Enable RLS
ALTER TABLE public.idea_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view documents for ideas they have access to
CREATE POLICY "Users can view idea documents" ON public.idea_documents
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can create documents for ideas they own or have permission for
CREATE POLICY "Users can create idea documents" ON public.idea_documents
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' 
    AND (
      -- User owns the idea
      EXISTS (
        SELECT 1 FROM public.ideas 
        WHERE id = idea_id AND submitted_by = auth.uid()
      )
      OR
      -- User is admin or core team
      public.is_core_team_or_admin(auth.uid())
      OR
      -- User has specific role permissions (can be expanded)
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'idealabs_core_team', 'idea_mentor')
      )
    )
  );

-- Users can update documents they created or have admin access
CREATE POLICY "Users can update idea documents" ON public.idea_documents
  FOR UPDATE USING (
    auth.uid() = created_by 
    OR public.is_core_team_or_admin(auth.uid())
  );

-- Users can delete documents they created or have admin access
CREATE POLICY "Users can delete idea documents" ON public.idea_documents
  FOR DELETE USING (
    auth.uid() = created_by 
    OR public.is_core_team_or_admin(auth.uid())
  );

-- Create trigger to maintain updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_idea_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_idea_documents_updated_at
  BEFORE UPDATE ON public.idea_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_idea_documents_updated_at();

-- Create function to get latest document of each type for an idea
CREATE OR REPLACE FUNCTION public.get_latest_idea_documents(_idea_id uuid)
RETURNS TABLE (
  document_type text,
  content text,
  content_json jsonb,
  file_url text,
  is_ai_generated boolean,
  title text,
  version text,
  status text,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (d.document_type)
    d.document_type,
    d.content,
    d.content_json,
    d.file_url,
    d.is_ai_generated,
    d.title,
    d.version,
    d.status,
    d.created_at,
    d.updated_at
  FROM public.idea_documents d
  WHERE d.idea_id = _idea_id
  ORDER BY d.document_type, d.version DESC, d.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.idea_documents TO authenticated;
GRANT USAGE ON SEQUENCE idea_documents_id_seq TO authenticated;

-- Insert some sample document types for reference
INSERT INTO public.idea_documents (idea_id, document_type, title, description, content, created_by)
SELECT 
  i.id,
  'prd_one_pager',
  'One Pager PRD',
  'AI-generated one-page product requirements document',
  'This is a placeholder for the One Pager PRD. Click Generate to create content.',
  i.submitted_by
FROM public.ideas i
WHERE NOT EXISTS (
  SELECT 1 FROM public.idea_documents 
  WHERE idea_id = i.id AND document_type = 'prd_one_pager'
)
ON CONFLICT DO NOTHING;

-- Add target_audience column to ideas table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ideas' AND column_name = 'target_audience'
  ) THEN
    ALTER TABLE public.ideas ADD COLUMN target_audience text;
  END IF;
END $$;
