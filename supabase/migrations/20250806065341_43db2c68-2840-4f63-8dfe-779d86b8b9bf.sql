-- Update the idea_stage enum to match the required stages
ALTER TYPE idea_stage RENAME TO idea_stage_old;

CREATE TYPE idea_stage AS ENUM (
  'discovery',
  'basic_validation', 
  'tech_validation',
  'leadership_pitch',
  'mvp'
);

-- Update existing data to map to new stages
ALTER TABLE ideas ALTER COLUMN stage TYPE idea_stage USING 
  CASE stage::text
    WHEN 'pending' THEN 'discovery'::idea_stage
    WHEN 'basic_review' THEN 'basic_validation'::idea_stage 
    WHEN 'tech_review' THEN 'tech_validation'::idea_stage
    WHEN 'ready_for_pitch' THEN 'leadership_pitch'::idea_stage
    WHEN 'mvp_poc' THEN 'mvp'::idea_stage
    ELSE 'discovery'::idea_stage
  END;

-- Update status_updates table
ALTER TABLE status_updates ALTER COLUMN previous_stage TYPE idea_stage USING 
  CASE previous_stage::text
    WHEN 'pending' THEN 'discovery'::idea_stage
    WHEN 'basic_review' THEN 'basic_validation'::idea_stage 
    WHEN 'tech_review' THEN 'tech_validation'::idea_stage
    WHEN 'ready_for_pitch' THEN 'leadership_pitch'::idea_stage
    WHEN 'mvp_poc' THEN 'mvp'::idea_stage
    ELSE 'discovery'::idea_stage
  END;

ALTER TABLE status_updates ALTER COLUMN new_stage TYPE idea_stage USING 
  CASE new_stage::text
    WHEN 'pending' THEN 'discovery'::idea_stage
    WHEN 'basic_review' THEN 'basic_validation'::idea_stage 
    WHEN 'tech_review' THEN 'tech_validation'::idea_stage
    WHEN 'ready_for_pitch' THEN 'leadership_pitch'::idea_stage
    WHEN 'mvp_poc' THEN 'mvp'::idea_stage
    ELSE 'discovery'::idea_stage
  END;

-- Drop the old type
DROP TYPE idea_stage_old;