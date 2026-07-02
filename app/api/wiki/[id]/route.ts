import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Try to delete as topic first
    const { error: topicError } = await supabase
      .from('topics')
      .delete()
      .eq('id', id)

    if (!topicError) {
      return NextResponse.json({ success: true })
    }

    // If not a topic, try as subject
    const { error: subjectError } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)

    if (!subjectError) {
      return NextResponse.json({ success: true })
    }

    // If not a subject, try as content item
    const { error: contentError } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id)

    if (!contentError) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Item not found' },
      { status: 404 }
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

