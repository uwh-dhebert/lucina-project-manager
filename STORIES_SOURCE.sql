-- Distinguish AI-generated stories from manually added ones.
-- Regenerate replaces only source = 'generated' and keeps manuals.
-- Safe to re-run.

ALTER TABLE project_stories
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'generated';

UPDATE project_stories
SET source = 'generated'
WHERE source IS NULL OR source NOT IN ('generated', 'manual');
