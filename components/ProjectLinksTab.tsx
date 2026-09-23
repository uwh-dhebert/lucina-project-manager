'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Link2, Plus, Trash2 } from 'lucide-react';

interface ProjectLink {
  id: string;
  title: string;
  url: string;
  description: string | null;
}

export function ProjectLinksTab({ projectId }: { projectId: string }) {
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch(`/api/projects/${projectId}/links`)
      .then(async (response) => {
        const data = await response.json();
        if (!active) return;
        if (response.ok) {
          setLinks(data.links ?? []);
          setError('');
        } else {
          setError(data.error ?? 'Failed to load links');
        }
      })
      .catch(() => {
        if (active) setError('Failed to load links');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  const addLink = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const response = await fetch(`/api/projects/${projectId}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, url, description }),
    });
    const data = await response.json();
    if (response.ok) {
      setLinks((current) => [data.link, ...current]);
      setTitle('');
      setUrl('');
      setDescription('');
    } else {
      setError(data.error ?? 'Failed to add link');
    }
    setSaving(false);
  };

  const deleteLink = async (linkId: string) => {
    const response = await fetch(`/api/projects/${projectId}/links`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId }),
    });
    if (response.ok) {
      setLinks((current) => current.filter((link) => link.id !== linkId));
    } else {
      const data = await response.json();
      setError(data.error ?? 'Failed to delete link');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={addLink} className="rounded-lg border border-lucina-rose bg-lucina-surface p-4">
        <div className="mb-4 flex items-center gap-2">
          <Link2 size={18} className="text-lucina-secondary" />
          <h3 className="font-semibold text-lucina-primary">Add a project link</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Link title"
            required
            className="rounded-lg border border-lucina-rose bg-lucina-white px-3 py-2 text-lucina-primary"
          />
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com"
            type="url"
            required
            className="rounded-lg border border-lucina-rose bg-lucina-white px-3 py-2 text-lucina-primary"
          />
        </div>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="mt-3 w-full rounded-lg border border-lucina-rose bg-lucina-white px-3 py-2 text-lucina-primary"
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-lucina-rose px-4 py-2 font-medium text-lucina-primary hover:bg-lucina-rose-hover disabled:opacity-50"
          >
            <Plus size={17} />
            {saving ? 'Adding...' : 'Add Link'}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="py-8 text-center text-lucina-muted">Loading links...</p>
      ) : links.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-lucina-rose p-10 text-center">
          <Link2 size={36} className="mx-auto mb-3 text-lucina-muted" />
          <p className="font-medium text-lucina-primary">No project links yet</p>
          <p className="mt-1 text-sm text-lucina-muted">Add documentation, repositories, dashboards, or other resources.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {links.map((link) => (
            <div key={link.id} className="group rounded-xl border border-lucina-rose bg-lucina-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1"
                >
                  <span className="flex items-center gap-2 font-semibold text-lucina-primary hover:text-lucina-secondary">
                    <span className="truncate">{link.title}</span>
                    <ExternalLink size={14} className="shrink-0" />
                  </span>
                  <span className="mt-1 block truncate text-xs text-lucina-muted">{link.url}</span>
                </a>
                <button
                  type="button"
                  onClick={() => void deleteLink(link.id)}
                  title="Delete link"
                  className="rounded p-1.5 text-lucina-muted hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {link.description && <p className="mt-3 text-sm text-lucina-muted">{link.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
