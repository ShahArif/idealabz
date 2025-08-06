-- Update the idea_stage enum to match the required stages
DROP TYPE IF EXISTS idea_stage CASCADE;
CREATE TYPE idea_stage AS ENUM (
  'discovery',
  'basic_validation', 
  'tech_validation',
  'leadership_pitch',
  'mvp'
);

-- Update the ideas table to use the new stage enum
ALTER TABLE ideas ALTER COLUMN stage TYPE idea_stage USING stage::text::idea_stage;
ALTER TABLE ideas ALTER COLUMN stage SET DEFAULT 'discovery'::idea_stage;

-- Update status_updates table to use the new enum  
ALTER TABLE status_updates ALTER COLUMN previous_stage TYPE idea_stage USING previous_stage::text::idea_stage;
ALTER TABLE status_updates ALTER COLUMN new_stage TYPE idea_stage USING new_stage::text::idea_stage;