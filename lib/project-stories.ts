export interface StoryRecord {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  createdAt?: string;
  updatedAt?: string;
}

export function mapStoryRow(row: Record<string, unknown>): StoryRecord {
  const rawCriteria = row.acceptance_criteria ?? row.acceptanceCriteria;

  return {
    id: String(row.id ?? ''),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    acceptanceCriteria: Array.isArray(rawCriteria) ? rawCriteria.map(String) : [],
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

