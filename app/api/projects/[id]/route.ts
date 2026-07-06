import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { PRIORITY_ZONES, type PriorityZone } from '@/lib/project-priorities'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, responsible, priorityZone } = body

    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('ownerId, priorityZone')
      .eq('id', projectId)
      .single()

    if (fetchError || !project) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const now = new Date().toISOString()
    const updates: Record<string, string | number> = { updatedAt: now }

    if (typeof name === 'string' && name.trim()) {
      updates.name = name.trim()
    }
    if (description !== undefined) {
      updates.description = description
    }
    if (typeof responsible === 'string') {
      updates.responsible = responsible.trim()
    }
    if (typeof priorityZone === 'string' && PRIORITY_ZONES.includes(priorityZone as PriorityZone)) {
      updates.priorityZone = priorityZone

      if (priorityZone !== project.priorityZone) {
        const { data: existingInZone } = await supabase
          .from('projects')
          .select('priorityOrder')
          .eq('ownerId', user.id)
          .eq('priorityZone', priorityZone)
          .order('priorityOrder', { ascending: false })
          .limit(1)

        updates.priorityOrder =
          existingInZone?.[0]?.priorityOrder != null
            ? existingInZone[0].priorityOrder + 1
            : 0
      }
    }

    if (Object.keys(updates).length === 1) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data: updated, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('PATCH error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

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

    const { id: projectId } = await params

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Verify the user owns this project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('ownerId')
      .eq('id', projectId)
      .single()

    if (fetchError || !project) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

