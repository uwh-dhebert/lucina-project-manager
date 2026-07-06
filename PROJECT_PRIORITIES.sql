-- Add priority board columns to the projects table (single source of truth).
-- Run this in Supabase SQL Editor.

ALTER TABLE projects ADD COLUMN IF NOT EXISTS responsible VARCHAR(255) DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "priorityZone" VARCHAR(255) DEFAULT 'in_design';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "priorityOrder" INT DEFAULT 0;

-- Backfill existing projects into In Design
UPDATE projects
SET "priorityZone" = 'in_design'
WHERE "priorityZone" IS NULL OR "priorityZone" = '';

UPDATE projects
SET "priorityOrder" = 0
WHERE "priorityOrder" IS NULL;