import postgres from 'postgres';

const MIGRATION_SQL = `
ALTER TABLE links
  ADD COLUMN IF NOT EXISTS "order" INT NOT NULL DEFAULT 0;

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
WHERE l.id = ranked.id
  AND (l."order" IS NULL OR l."order" = 0);

NOTIFY pgrst, 'reload schema';
`;

export async function ensureLinksOrderColumn(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
  }

  const db = postgres(databaseUrl, { ssl: 'require', max: 1 });
  try {
    await db.unsafe(MIGRATION_SQL);
  } finally {
    await db.end();
  }
}

export function isLinksOrderColumnMissingError(message?: string): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes('order') &&
    (lower.includes('column') ||
      lower.includes('schema cache') ||
      lower.includes('could not find'))
  );
}
