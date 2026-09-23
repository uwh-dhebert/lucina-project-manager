import postgres from 'postgres';

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS project_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_links_project_id ON project_links(project_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON project_links TO authenticated;
REVOKE ALL ON project_links FROM anon;

ALTER TABLE project_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS project_links_select ON project_links;
CREATE POLICY project_links_select ON project_links FOR SELECT
  USING (public.can_access_project(project_id));

DROP POLICY IF EXISTS project_links_insert ON project_links;
CREATE POLICY project_links_insert ON project_links FOR INSERT
  WITH CHECK (public.can_access_project(project_id));

DROP POLICY IF EXISTS project_links_update ON project_links;
CREATE POLICY project_links_update ON project_links FOR UPDATE
  USING (public.can_access_project(project_id))
  WITH CHECK (public.can_access_project(project_id));

DROP POLICY IF EXISTS project_links_delete ON project_links;
CREATE POLICY project_links_delete ON project_links FOR DELETE
  USING (public.can_access_project(project_id));

NOTIFY pgrst, 'reload schema';
`;

export async function ensureProjectLinksTable(): Promise<void> {
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

export function isProjectLinksTableMissingError(message?: string): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes('could not find the table') ||
    lower.includes('schema cache') ||
    lower.includes('does not exist') ||
    lower.includes('project_links')
  );
}
