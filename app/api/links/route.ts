import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import {
  ensureLinksOrderColumn,
  isLinksOrderColumnMissingError,
} from '@/lib/setup-links-order';
import { getErrorMessage } from '@/lib/errors';

async function insertLink(
  supabase: Awaited<ReturnType<typeof createClient>>,
  groupId: string,
  title: string,
  url: string
) {
  const { data: existing } = await supabase
    .from('links')
    .select('order')
    .eq('groupId', groupId)
    .order('order', { ascending: false })
    .limit(1);

  const nextOrder =
    existing && existing.length > 0 && typeof existing[0].order === 'number'
      ? existing[0].order + 1
      : 0;

  const { data: link, error } = await supabase
    .from('links')
    .insert({
      groupId,
      title,
      url,
      order: nextOrder,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return link;
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
    const { groupId, title, url } = body;

    if (!groupId || !title || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: group } = await supabase
      .from('link_groups')
      .select('userId')
      .eq('id', groupId)
      .single();

    if (!group || group.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
      const link = await insertLink(supabase, groupId, title.trim(), url.trim());
      return NextResponse.json(link ?? {});
    } catch (error: unknown) {
      if (!isLinksOrderColumnMissingError(getErrorMessage(error))) {
        throw error;
      }
      await ensureLinksOrderColumn();
      const link = await insertLink(supabase, groupId, title.trim(), url.trim());
      return NextResponse.json(link ?? {});
    }
  } catch (error: unknown) {
    console.error('Error creating link:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
