/**
 * Generate Stories from Design Document API
 * Replaces existing AI-generated stories while keeping manual ones.
 */

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { canAccessProject } from '@/lib/project-access';
import { mapStoryRow } from '@/lib/project-stories';
import { getErrorMessage } from '@/lib/errors';
import {
  ensureStorySourceColumn,
  isStorySourceColumnMissingError,
} from '@/lib/setup-stories-source';

interface GenerateStoriesRequest {
  designDoc: string;
}

async function replaceGeneratedStories(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  stories: Array<{
    title: string;
    description: string;
    acceptanceCriteria: string[];
  }>
) {
  // Remove previous AI stories only — manual stories stay.
  const { error: deleteError } = await supabase
    .from('project_stories')
    .delete()
    .eq('project_id', projectId)
    .eq('source', 'generated');

  if (deleteError) throw new Error(deleteError.message);

  if (stories.length === 0) {
    const { data: remaining, error } = await supabase
      .from('project_stories')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (remaining ?? []).map((row) => mapStoryRow(row as Record<string, unknown>));
  }

  const rows = stories.map((story) => ({
    id: randomUUID(),
    project_id: projectId,
    title: story.title,
    description: story.description,
    acceptance_criteria: story.acceptanceCriteria || [],
    source: 'generated',
  }));

  const { error: insertError } = await supabase.from('project_stories').insert(rows);
  if (insertError) throw new Error(insertError.message);

  const { data: allStories, error: listError } = await supabase
    .from('project_stories')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (listError) throw new Error(listError.message);

  return (allStories ?? []).map((row) => mapStoryRow(row as Record<string, unknown>));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!process.env.XAI_API_KEY) {
      return NextResponse.json(
        {
          error: 'API configuration error',
          message: 'xAI API key is not configured',
        },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body: GenerateStoriesRequest = await request.json();
    const { designDoc } = body;

    if (!designDoc) {
      return NextResponse.json(
        { error: 'Design document is required' },
        { status: 400 }
      );
    }

    const allowed = await canAccessProject(supabase, user.id, projectId);
    if (!allowed) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const prompt = buildStoriesPrompt(designDoc, project.name);

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.XAI_MODEL || 'grok-4-1-fast-reasoning',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert software engineer and product manager. Generate well-formed user stories with clear acceptance criteria based on the design document provided. Return the stories as a JSON array with the specified format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiMessage =
        (errorData as { error?: { message?: string } })?.error?.message || 'Unknown error';
      throw new Error(`Grok API error: ${response.status} - ${apiMessage}`);
    }

    const data = await response.json();
    const storiesText = data.choices?.[0]?.message?.content || '';

    let generated: Array<{
      title: string;
      description: string;
      acceptanceCriteria: string[];
    }> = [];
    try {
      const jsonMatch = storiesText.match(/\[[\s\S]*\]/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      if (Array.isArray(parsed)) {
        generated = parsed.map((item: Record<string, unknown>) => ({
          title: String(item.title ?? 'Untitled story'),
          description: String(item.description ?? ''),
          acceptanceCriteria: Array.isArray(item.acceptanceCriteria)
            ? item.acceptanceCriteria.map(String)
            : [],
        }));
      }
    } catch (e) {
      console.error('Error parsing stories JSON:', e);
      generated = [];
    }

    const persist = async () => replaceGeneratedStories(supabase, projectId, generated);

    let stories;
    try {
      stories = await persist();
    } catch (error: unknown) {
      if (!isStorySourceColumnMissingError(getErrorMessage(error))) {
        throw error;
      }
      await ensureStorySourceColumn();
      stories = await persist();
    }

    return NextResponse.json(
      {
        success: true,
        stories,
        generatedCount: generated.length,
        project: {
          id: project.id,
          name: project.name,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Story generation error:', error);
    const message = getErrorMessage(error);

    if (message.includes('XAI_API_KEY')) {
      return NextResponse.json(
        {
          error: 'API configuration error',
          message: 'xAI API key is not configured',
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildStoriesPrompt(designDoc: string, projectName: string): string {
  return `Based on the following project design document for "${projectName}", generate 5-10 user stories.

Design Document:
${designDoc}

Generate stories in the following JSON format (return ONLY valid JSON array, no other text):
[
  {
    "title": "User Story Title",
    "description": "As a [user type], I want to [action], so that [benefit]",
    "acceptanceCriteria": [
      "Given [context], when [action], then [expected result]",
      "Additional criteria..."
    ]
  }
]

Requirements for stories:
- Each story should be specific and actionable
- Acceptance criteria should be testable and clear
- Stories should cover key features from the design document
- Include both user-facing and technical stories
- Prioritize stories based on the phased approach mentioned in the design doc`;
}
