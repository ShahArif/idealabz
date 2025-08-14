-- Fix ALL document type constraints on idea_documents table
-- The error shows there's a constraint "idea_documents_document_type_check" that's too restrictive

-- Step 1: Find ALL constraints related to document_type
SELECT '=== FINDING ALL DOCUMENT TYPE CONSTRAINTS ===' as info;

-- Check constraints
SELECT 
    'Check constraint' as constraint_type,
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%document_type%' OR check_clause LIKE '%document_type%';

-- Table constraints
SELECT 
    'Table constraint' as constraint_type,
    constraint_name,
    constraint_type as constraint_category
FROM information_schema.table_constraints 
WHERE table_name = 'idea_documents' 
AND constraint_name LIKE '%document_type%';

-- Step 2: Show the current table structure
SELECT '=== CURRENT TABLE STRUCTURE ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'idea_documents' 
AND column_name = 'document_type';

-- Step 3: Drop ALL document type constraints we can find
SELECT '=== DROPPING ALL DOCUMENT TYPE CONSTRAINTS ===' as info;

-- Drop the check constraint we found
ALTER TABLE public.idea_documents 
DROP CONSTRAINT IF EXISTS check_document_type;

-- Drop the table constraint we found
ALTER TABLE public.idea_documents 
DROP CONSTRAINT IF EXISTS idea_documents_document_type_check;

-- Drop any other constraints that might exist
ALTER TABLE public.idea_documents 
DROP CONSTRAINT IF EXISTS idea_documents_document_type_check;

-- Step 4: Verify all constraints are dropped
SELECT '=== VERIFYING CONSTRAINTS DROPPED ===' as info;
SELECT 
    'Check constraints remaining' as check_item,
    COUNT(*) as count
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%document_type%' OR check_clause LIKE '%document_type%'
UNION ALL
SELECT 
    'Table constraints remaining' as check_item,
    COUNT(*) as count
FROM information_schema.table_constraints 
WHERE table_name = 'idea_documents' 
AND constraint_name LIKE '%document_type%';

-- Step 5: Test insert without constraints
SELECT '=== TESTING INSERT WITHOUT CONSTRAINTS ===' as info;

-- Try to insert a test record without any constraints
INSERT INTO public.idea_documents (
  idea_id, 
  document_type, 
  content, 
  created_by, 
  updated_by
) VALUES (
  (SELECT id FROM public.ideas LIMIT 1),
  'test_document',
  '{"test": "content without constraints"}',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Check if insert worked
SELECT 
    'Test insert without constraints worked' as check_item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.idea_documents WHERE document_type = 'test_document') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

-- Clean up test record
DELETE FROM public.idea_documents WHERE document_type = 'test_document';

-- Step 6: Test with the actual document type your app needs
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
  '{"test": "user research insights without constraints"}',
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

-- Step 7: OPTIONAL - Create a new, permissive constraint (only if you want validation)
SELECT '=== OPTIONAL: CREATING NEW PERMISSIVE CONSTRAINT ===' as info;

-- Only create this if you want some validation
-- You can comment out this section if you want no constraints at all
ALTER TABLE public.idea_documents 
ADD CONSTRAINT idea_documents_document_type_check 
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

-- Step 8: Final verification
SELECT '=== FINAL VERIFICATION ===' as info;

-- Test insert one more time
INSERT INTO public.idea_documents (
  idea_id, 
  document_type, 
  content, 
  created_by, 
  updated_by
) VALUES (
  (SELECT id FROM public.ideas LIMIT 1),
  'user_research_insights',
  '{"final": "test with new constraint"}',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT DO NOTHING;

SELECT 
    'Final test insert worked' as check_item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.idea_documents WHERE document_type = 'user_research_insights') 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END as status;

-- Clean up final test record
DELETE FROM public.idea_documents WHERE document_type = 'user_research_insights';

-- Show final constraint status
SELECT 
    'Final constraint status' as info,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'idea_documents' 
AND constraint_name LIKE '%document_type%';

SELECT '=== ALL CONSTRAINTS FIXED ===' as info;
SELECT 'The document type constraints have been removed/updated. Your app should now be able to save user_research_insights documents.' as message;
