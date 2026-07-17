export type StorySource = 'generated' | 'manual';

export interface StoryRecord {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  source: StorySource;
  createdAt?: string;
  updatedAt?: string;
}

export function normalizeStorySource(value: unknown): StorySource {
  return value === 'manual' ? 'manual' : 'generated';
}

export function mapStoryRow(row: Record<string, unknown>): StoryRecord {
  const rawCriteria = row.acceptance_criteria ?? row.acceptanceCriteria;

  return {
    id: String(row.id ?? ''),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    acceptanceCriteria: Array.isArray(rawCriteria) ? rawCriteria.map(String) : [],
    source: normalizeStorySource(row.source),
    createdAt: row.created_at ? String(row.created_at) : row.createdAt ? String(row.createdAt) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : row.updatedAt ? String(row.updatedAt) : undefined,
  };
}
