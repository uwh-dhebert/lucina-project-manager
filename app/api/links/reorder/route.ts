import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  ensureLinksOrderColumn,
  isLinksOrderColumnMissingError,
} from '@/lib/setup-links-order';
import { getErrorMessage } from '@/lib/errors';

interface GroupOrderItem {
  id: string;
  order: number;
}

interface LinkOrderItem {
  id: string;
  order: number;
  groupId?: string;
}

async function applyReorder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  groups: GroupOrderItem[],
  links: LinkOrderItem[]
): Promise<{ ok: true } | { ok: false; status: 403; error: string }> {
  const now = new Date().toISOString();

  if (groups.length > 0) {
    const { data: ownedGroups, error } = await supabase
      .from('link_groups')
      .select('id')
      .eq('userId', userId)
      .in(
        'id',
        groups.map((g) => g.id)
      );

    if (error) throw new Error(error.message);

    const owned = new Set((ownedGroups ?? []).map((g) => g.id));
    if (groups.some((g) => !owned.has(g.id))) {
      return { ok: false, status: 403, error: 'Unauthorized to reorder one or more groups' };
    }

    const results = await Promise.all(
      groups.map((item) =>
        supabase
          .from('link_groups')
          .update({ order: item.order, updatedAt: now })
          .eq('id', item.id)
          .eq('userId', userId)
      )
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw new Error(failed.error.message);
  }

  if (links.length > 0) {
    const { data: ownedLinks, error } = await supabase
      .from('links')
      .select('id, groupId, group:link_groups!inner(userId)')
      .in(
        'id',
        links.map((l) => l.id)
      );

    if (error) throw new Error(error.message);

    const byId = new Map(
      (ownedLinks ?? []).map((row) => {
        const group = row.group as { userId?: string } | { userId?: string }[] | null;
        const userIdFromGroup = Array.isArray(group)
          ? group[0]?.userId
          : group?.userId;
        return [row.id as string, { groupId: row.groupId as string, userId: userIdFromGroup }];
      })
    );

    for (const item of links) {
      const owned = byId.get(item.id);
      if (!owned || owned.userId !== userId) {
        return { ok: false, status: 403, error: 'Unauthorized to reorder one or more links' };
      }
    }

    const results = await Promise.all(
      links.map((item) => {
        const patch: { order: number; updatedAt: string; groupId?: string } = {
          order: item.order,
          updatedAt: now,
        };
        if (item.groupId) {
          patch.groupId = item.groupId;
        }
        return supabase.from('links').update(patch).eq('id', item.id);
      })
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw new Error(failed.error.message);
  }

  return { ok: true };
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const groups: GroupOrderItem[] = Array.isArray(body.groups) ? body.groups : [];
    const links: LinkOrderItem[] = Array.isArray(body.links) ? body.links : [];

    if (groups.length === 0 && links.length === 0) {
      return NextResponse.json(
        { error: 'Provide groups and/or links to reorder' },
        { status: 400 }
      );
    }

    for (const item of groups) {
      if (!item?.id || typeof item.order !== 'number') {
        return NextResponse.json({ error: 'Invalid group reorder item' }, { status: 400 });
      }
    }
    for (const item of links) {
      if (!item?.id || typeof item.order !== 'number') {
        return NextResponse.json({ error: 'Invalid link reorder item' }, { status: 400 });
      }
    }

    const run = async () => applyReorder(supabase, user.id, groups, links);

    try {
      const result = await run();
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json({ success: true });
    } catch (firstError: unknown) {
      const message = getErrorMessage(firstError);
      if (!isLinksOrderColumnMissingError(message)) {
        throw firstError;
      }
      await ensureLinksOrderColumn();
      const result = await run();
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json({ success: true, migrated: true });
    }
  } catch (error: unknown) {
    console.error('Links reorder error:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
