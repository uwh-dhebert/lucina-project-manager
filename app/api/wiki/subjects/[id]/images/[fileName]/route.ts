import { NextRequest, NextResponse } from 'next/server'
import { ownsSubject } from '@/lib/wiki-access'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

const BUCKET = 'wiki-content-images'
const SAFE_FILE_NAME = /^[0-9a-f-]{36}\.(gif|jpe?g|png|webp)$/i

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; fileName: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: subjectId, fileName } = await params
  if (!SAFE_FILE_NAME.test(fileName)) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }
  if (!(await ownsSubject(supabase, user.id, subjectId))) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from(BUCKET)
    .download(`${subjectId}/${fileName}`)
  if (error || !data) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  return new NextResponse(data, {
    headers: {
      'Cache-Control': 'private, max-age=3600',
      'Content-Type': data.type || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
