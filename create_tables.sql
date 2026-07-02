-- Create project_design_docs table
CREATE TABLE IF NOT EXISTS project_design_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique index on project_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_design_docs_project_id ON project_design_docs(project_id);

-- Create project_stories table
CREATE TABLE IF NOT EXISTS project_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  acceptance_criteria text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on project_id
CREATE INDEX IF NOT EXISTS idx_project_stories_project_id ON project_stories(project_id);

-- Create project_notes table
CREATE TABLE IF NOT EXISTS project_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on project_id
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);

