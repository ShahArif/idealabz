-- Fix document type constraint issue for idea_documents table
-- The error shows there's a check constraint "check_document_type" that's too restrictive

-- Step 1: Check the current constraint
SELECT '=== CURRENT CONSTRAINT ===' as info;
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'check_document_type';

-- Step 2: Show what document types are currently allowed
SELECT '=== CURRENT ALLOWED DOCUMENT TYPES ===' as info;
SELECT 
    'Check constraint details' as info,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'check_document_type';

-- Step 3: Drop the restrictive constraint
SELECT '=== DROPPING RESTRICTIVE CONSTRAINT ===' as info;
ALTER TABLE public.idea_documents 
DROP CONSTRAINT IF EXISTS check_document_type;

-- Step 4: Create a new, more permissive constraint
SELECT '=== CREATING NEW PERMISSIVE CONSTRAINT ===' as info;
ALTER TABLE public.idea_documents 
ADD CONSTRAINT check_document_type 
CHECK (document_type IN (
  'prd_one_pager',
  'prd_full',
  'market_research',
  'competitor_analysis',
  'user_research',
  'user_research_insights',  -- This is what your app needs
  'user_pains',              -- This is what your app needs
  'tech_feasibility',
  'leadership_pitch',
  'mvp_plan',
  'financial_analysis',
  'risk_assessment',
  'go_to_market',
  'ideation_frameworks',
  'framework_implementation',
  'test_document',           -- Allow test documents
  'other'
));

-- Step 5: Test the new constraint
SELECT '=== TESTING NEW CONSTRAINT ===' as info;

-- Try to insert a test record with the new constraint
INSERT INTO public.idea_documents (
  idea_id, 
  document_type, 
  content, 
  created_by, 
  updated_by
) VALUES (
  (SELECT id FROM public.ideas LIMIT 1),
  'test_document',
  '{"test": "content with new constraint"}',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Check if insert worked
SELECT 
    'Test insert with new constraint worked' as check_item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.idea_documents WHERE document_type = 'test_document') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

-- Clean up test record
DELETE FROM public.idea_documents WHERE document_type = 'test_document';

-- Step 6: Now test with the actual document type your app needs
SELECT '=== TESTING ACTUAL DOCUMENT TYPE ===' as info;

-- Try to insert with user_research_insights (what your app actually uses)
INSERT INTO public.idea_documents (
  idea_id, 
  document_type, 
  content, 
  created_by, 
  updated_by
) VALUES (
  (SELECT id FROM public.ideas LIMIT 1),
  'user_research_insights',
  '{"test": "user research insights"}',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Check if insert worked
SELECT 
    'Test insert with user_research_insights worked' as check_item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.idea_documents WHERE document_type = 'user_research_insights') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

-- Clean up test record
DELETE FROM public.idea_documents WHERE document_type = 'user_research_insights';

-- Step 7: Verify the final constraint
SELECT '=== FINAL CONSTRAINT VERIFICATION ===' as info;
SELECT 
    'New constraint created' as check_item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.check_constraints 
            WHERE constraint_name = 'check_document_type'
        ) THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

-- Show the new constraint details
SELECT 
    'New constraint details' as info,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'check_document_type';

SELECT '=== CONSTRAINT FIX COMPLETE ===' as info;
SELECT 'The document type constraint has been updated to allow user_research_insights and other needed types.' as message;
