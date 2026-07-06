import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [projectsRes, docsRes, linksRes] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('ownerId', user.id),
      supabase.from('topics').select('id', { count: 'exact', head: true }),
      supabase.from('links').select('id', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      projects: projectsRes.count ?? 0,
      documents: docsRes.count ?? 0,
      links: linksRes.count ?? 0,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}