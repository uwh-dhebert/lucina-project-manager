import postgres from 'postgres';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!m) continue;
      let val = m[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[m[1]]) process.env[m[1]] = val;
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

try {
  await db.unsafe(`
ALTER TABLE project_stories
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'generated';
`);

  const before = await db`
    SELECT source, count(*)::int AS n
    FROM project_stories
    GROUP BY source
    ORDER BY source
  `;
  console.log('before:', before);

  const updated = await db`
    UPDATE project_stories
    SET source = 'generated'
    WHERE source IS DISTINCT FROM 'generated'
    RETURNING id
  `;
  console.log(`flagged ${updated.length} story(ies) as generated`);

  const after = await db`
    SELECT source, count(*)::int AS n
    FROM project_stories
    GROUP BY source
    ORDER BY source
  `;
  console.log('after:', after);

  await db.unsafe(`NOTIFY pgrst, 'reload schema'`);
} finally {
  await db.end();
}
