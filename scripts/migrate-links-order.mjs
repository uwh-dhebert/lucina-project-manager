import postgres from 'postgres';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // ignore
  }
}

loadEnvLocal();

const url = (process.env.DATABASE_URL || '').trim();
if (!url) {
  console.error('DATABASE_URL missing');
  process.exit(1);
}

const db = postgres(url, { ssl: 'require', max: 1 });

const sql = `
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
WHERE l.id = ranked.id;

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

NOTIFY pgrst, 'reload schema';
`;

try {
  await db.unsafe(sql);
  console.log('links order migration applied');
} finally {
  await db.end();
}
