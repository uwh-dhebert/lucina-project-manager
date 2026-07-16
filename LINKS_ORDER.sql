-- Drag-and-drop ordering for links within groups.
-- link_groups already has "order"; links did not.
-- Safe to re-run.

ALTER TABLE links
  ADD COLUMN IF NOT EXISTS "order" INT NOT NULL DEFAULT 0;

-- Backfill existing rows so current visual order is stable (createdAt order).
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "groupId"
      ORDER BY "createdAt" ASC NULLS LAST, id ASC
    ) - 1 AS sort_order
  FROM links
)
UPDATE links l
SET "order" = ranked.sort_order
FROM ranked
WHERE l.id = ranked.id;

-- Groups: ensure order is unique-ish per user (createdAt if all zero).
WITH ranked_groups AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "order" ASC, "createdAt" ASC NULLS LAST, id ASC
    ) - 1 AS sort_order
  FROM link_groups
)
UPDATE link_groups g
SET "order" = ranked_groups.sort_order
FROM ranked_groups
WHERE g.id = ranked_groups.id;
