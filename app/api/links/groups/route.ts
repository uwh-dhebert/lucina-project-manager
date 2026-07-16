import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import {
  ensureLinksOrderColumn,
  isLinksOrderColumnMissingError,
} from '@/lib/setup-links-order';
import { getErrorMessage } from '@/lib/errors';

function sortGroupsPayload(groups: Array<Record<string, unknown>>) {
  const sorted = [...groups].sort((a, b) => {
    const ao = typeof a.order === 'number' ? a.order : 0;
    const bo = typeof b.order === 'number' ? b.order : 0;
    if (ao !== bo) return ao - bo;
    return String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? ''));
  });

  return sorted.map((group) => {
    const links = Array.isArray(group.links) ? [...group.links] : [];
    links.sort((a, b) => {
      const rowA = a as Record<string, unknown>;
      const rowB = b as Record<string, unknown>;
      const ao = typeof rowA.order === 'number' ? rowA.order : 0;
      const bo = typeof rowB.order === 'number' ? rowB.order : 0;
      if (ao !== bo) return ao - bo;
      return String(rowA.createdAt ?? '').localeCompare(String(rowB.createdAt ?? ''));
    });
    return { ...group, links };
  });
}

async function fetchGroups(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: groups, error } = await supabase
    .from('link_groups')
    .select('*, links(*)')
    .eq('userId', userId)
    .order('order', { ascending: true })
    .order('createdAt', { ascending: true });

  if (error) throw new Error(error.message);
  return sortGroupsPayload((groups ?? []) as Array<Record<string, unknown>>);
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const groups = await fetchGroups(supabase, user.id);
      return NextResponse.json(groups);
    } catch (error: unknown) {
      if (!isLinksOrderColumnMissingError(getErrorMessage(error))) {
        throw error;
      }
      await ensureLinksOrderColumn();
      const groups = await fetchGroups(supabase, user.id);
      return NextResponse.json(groups);
    }
  } catch (error: unknown) {
    console.error('Error fetching link groups:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('link_groups')
      .select('order')
      .eq('userId', user.id)
      .order('order', { ascending: false })
      .limit(1);

    const nextOrder =
      existing && existing.length > 0 && typeof existing[0].order === 'number'
        ? existing[0].order + 1
        : 0;

    const { data: group, error } = await supabase
      .from('link_groups')
      .insert({
        userId: user.id,
        name: name.trim(),
        order: nextOrder,
      })
      .select('*, links(*)')
      .single();

    if (error) {
      console.error('Error creating link group:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(group ?? {});
  } catch (error: unknown) {
    console.error('Error creating link group:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
