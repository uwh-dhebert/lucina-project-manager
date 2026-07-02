import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ...existing code...
    // Fetch projects for the user
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('ownerId', user.id)
      .order('createdAt', { ascending: false });

    if (error) {
      // Check if table doesn't exist
      if (error.message.includes('Could not find the table')) {
        return NextResponse.json(
          { 
            error: 'Database not initialized',
            message: 'Please initialize your database first',
            redirect: '/setup'
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Generate UUID using Node's built-in crypto
    const projectId = randomUUID();
    const now = new Date().toISOString();

    // Create project with explicit ID and timestamps
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        id: projectId,
        name,
        slug,
        description: description || '',
        ownerId: user.id,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (error) {
      // Check if table doesn't exist
      if (error.message.includes('Could not find the table')) {
        return NextResponse.json(
          { 
            error: 'Database not initialized',
            message: 'Please initialize your database first',
            redirect: '/setup'
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

