import { NextRequest, NextResponse } from 'next/server';
import { canAccessProject } from '@/lib/project-access';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

const BUCKET = 'project-note-screenshots';
const SAFE_FILE_NAME = /^[0-9a-f-]{36}\.(gif|jpe?g|png|webp)$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; fileName: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: projectId, fileName } = await params;
  if (!SAFE_FILE_NAME.test(fileName)) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
  if (!(await canAccessProject(supabase, user.id, projectId))) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(BUCKET).download(`${projectId}/${fileName}`);
  if (error || !data) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  return new NextResponse(data, {
    headers: {
      'Cache-Control': 'private, max-age=3600',
      'Content-Type': data.type || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
