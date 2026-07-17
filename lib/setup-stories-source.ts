import postgres from 'postgres';

const MIGRATION_SQL = `
ALTER TABLE project_stories
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'generated';

-- Clamp any unexpected values.
UPDATE project_stories
SET source = 'generated'
WHERE source IS NULL OR source NOT IN ('generated', 'manual');

NOTIFY pgrst, 'reload schema';
`;

export async function ensureStorySourceColumn(): Promise<void> {
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

export function isStorySourceColumnMissingError(message?: string): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes('source') &&
    (lower.includes('column') ||
      lower.includes('schema cache') ||
      lower.includes('could not find'))
  );
}
