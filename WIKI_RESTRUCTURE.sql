-- Wiki Restructuring: Subjects and Content Items
-- Run this in Supabase SQL Editor

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  "order" INT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- Create content_items table (belongs to subject)
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "subjectId" UUID NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  "order" INT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),
  FOREIGN KEY ("subjectId") REFERENCES subjects(id) ON DELETE CASCADE
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS content_items_subjectId_idx ON content_items("subjectId");

-- Update topics table to make projectId nullable
ALTER TABLE topics ALTER COLUMN "projectId" DROP NOT NULL;

-- Create triggers for updated_at on subjects
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subjects_updated_at
BEFORE UPDATE ON subjects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_items_updated_at
BEFORE UPDATE ON content_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Verify tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('subjects', 'content_items')
ORDER BY table_name;

