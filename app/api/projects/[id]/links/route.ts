import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { canAccessProject } from '@/lib/project-access';
import { getErrorMessage } from '@/lib/errors';
import { createClient } from '@/utils/supabase/server';

type Supabase = Awaited<ReturnType<typeof createClient>>;
const MIGRATION_REQUIRED =
  'Project links are not configured yet. Run PROJECT_LINKS.sql in the Supabase SQL Editor.';

function isValidWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function listLinks(supabase: Supabase, projectId: string) {
  const { data, error } = await supabase
    .from('project_links')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await params;
    if (!(await canAccessProject(supabase, user.id, projectId))) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ links: await listLinks(supabase, projectId) });
  } catch (error) {
    const message = getErrorMessage(error);
    if (message.toLowerCase().includes('project_links')) {
      return NextResponse.json({ error: MIGRATION_REQUIRED }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await params;
    if (!(await canAccessProject(supabase, user.id, projectId))) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const url = typeof body.url === 'string' ? body.url.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
    }
    if (!isValidWebUrl(url)) {
      return NextResponse.json({ error: 'Enter a valid http or https URL' }, { status: 400 });
    }

    const insert = async () => {
      const { data, error } = await supabase
        .from('project_links')
        .insert({
          id: randomUUID(),
          project_id: projectId,
          title,
          url,
          description: description || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    };

    return NextResponse.json({ link: await insert() }, { status: 201 });
  } catch (error) {
    const message = getErrorMessage(error);
    if (message.toLowerCase().includes('project_links')) {
      return NextResponse.json({ error: MIGRATION_REQUIRED }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await params;
    if (!(await canAccessProject(supabase, user.id, projectId))) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    if (typeof body.linkId !== 'string' || !body.linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('project_links')
      .delete()
      .eq('id', body.linkId)
      .eq('project_id', projectId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete link';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
