import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { canAccessProject } from '@/lib/project-access';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

const BUCKET = 'project-note-screenshots';
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

async function ensureBucket() {
  const admin = createAdminClient();
  const { data } = await admin.storage.getBucket(BUCKET);
  if (data) return admin;

  const { error } = await admin.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: MAX_IMAGE_BYTES,
    allowedMimeTypes: Object.keys(IMAGE_EXTENSIONS),
  });
  if (error && !error.message.toLowerCase().includes('already exists')) throw error;
  return admin;
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

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Screenshot is required' }, { status: 400 });
    }

    const extension = IMAGE_EXTENSIONS[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: 'Screenshots must be PNG, JPEG, GIF, or WebP' },
        { status: 400 }
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Screenshot must be 10 MB or smaller' }, { status: 400 });
    }

    const fileName = `${randomUUID()}.${extension}`;
    const admin = await ensureBucket();
    const { error } = await admin.storage
      .from(BUCKET)
      .upload(`${projectId}/${fileName}`, file, { contentType: file.type, upsert: false });
    if (error) throw error;

    return NextResponse.json({
      url: `/api/projects/${projectId}/note-images/${fileName}`,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload screenshot';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
