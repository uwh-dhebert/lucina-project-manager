import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sortProjectsForPriorities, type PriorityZone } from '@/lib/project-priorities';

const VALID_ZONES: PriorityZone[] = ['active', 'prioritized', 'in_design'];

interface ReorderItem {
  id: string;
  zone: PriorityZone;
  sortOrder: number;
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const items: ReorderItem[] = body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }

    for (const item of items) {
      if (!item.id || !VALID_ZONES.includes(item.zone) || typeof item.sortOrder !== 'number') {
        return NextResponse.json({ error: 'Invalid item in reorder payload' }, { status: 400 });
      }
    }

    const now = new Date().toISOString();

    const results = await Promise.all(
      items.map((item) =>
        supabase
          .from('projects')
          .update({
            priorityZone: item.zone,
            priorityOrder: item.sortOrder,
            updatedAt: now,
          })
          .eq('id', item.id)
          .eq('ownerId', user.id)
      )
    );

    const failed = results.find((result) => result.error);
    if (failed?.error) {
      return NextResponse.json({ error: failed.error.message }, { status: 500 });
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('ownerId', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(sortProjectsForPriorities(projects ?? []));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}