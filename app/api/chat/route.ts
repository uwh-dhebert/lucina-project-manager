/**
 * Chat API Route
 * Handles POST requests for chatbot interactions
 */

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { ChatUseCase } from '@/application/chat/ChatUseCase';
import { GrokService } from '@/infrastructure/external/GrokService';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { conversationId, userMessage, contextDocumentIds, useRag, pageContext } = body;

    // Validate required fields
    if (!conversationId || !userMessage) {
      return NextResponse.json(
        { error: 'conversationId and userMessage are required' },
        { status: 400 }
      );
    }

    if (!userMessage.trim()) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // Guard against writing into another user's conversation. Conversations are
    // identified only by a client-generated id (never persisted as a row), so
    // ownership = whoever first posted under that id. The check runs on the admin
    // client because RLS would otherwise hide other users' messages from us.
    const admin = createAdminClient();
    const { data: foreignRows, error: ownershipError } = await admin
      .from('chat_messages')
      .select('id')
      .eq('conversationId', conversationId)
      .neq('userId', user.id)
      .limit(1);

    if (ownershipError) {
      console.error('Error verifying conversation ownership:', ownershipError);
      return NextResponse.json(
        { error: 'Could not verify conversation' },
        { status: 500 }
      );
    }

    if (foreignRows && foreignRows.length > 0) {
      return NextResponse.json(
        { error: 'Conversation does not belong to you' },
        { status: 403 }
      );
    }

    // Initialize services
    const grokService = new GrokService();
    const chatUseCase = new ChatUseCase(grokService);

    // Execute chat use case with page context
    const response = await chatUseCase.execute({
      userId: user.id,
      conversationId,
      userMessage: userMessage.trim(),
      contextDocumentIds: contextDocumentIds || [],
      useRag: useRag || true,
      pageContext: pageContext || '',
    });

    // Store messages in database
    const userMessageId = randomUUID();
    const assistantMessageId = randomUUID();
    const now = new Date().toISOString();

    // Store user message
    const { error: userMsgError } = await supabase
      .from('chat_messages')
      .insert({
        id: userMessageId,
        conversationId: response.conversationId,
        userId: user.id,
        content: response.userMessage,
        role: 'user',
        createdAt: now,
        updatedAt: now,
      });

    if (userMsgError) {
      console.error('Error storing user message:', userMsgError);
      // Don't fail the request, still return the chat response
    }

    // Store assistant message
    const { error: assistantMsgError } = await supabase
      .from('chat_messages')
      .insert({
        id: assistantMessageId,
        conversationId: response.conversationId,
        userId: user.id,
        content: response.assistantMessage,
        role: 'assistant',
        model: response.model,
        createdAt: now,
        updatedAt: now,
      });

    if (assistantMsgError) {
      console.error('Error storing assistant message:', assistantMsgError);
      // Don't fail the request, still return the chat response
    }

    return NextResponse.json(
      {
        success: true,
        userMessageId,
        assistantMessageId,
        response: {
          content: response.assistantMessage,
          model: response.model,
          tokensUsed: response.tokensUsed,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Chat API error:', error);

    // Return appropriate error response
    if (error.message.includes('XAI_API_KEY')) {
      return NextResponse.json(
        {
          error: 'API configuration error',
          message: 'xAI API key is not configured',
        },
        { status: 503 }
      );
    }

    if (error.message.includes('Grok API error')) {
      return NextResponse.json(
        {
          error: 'Grok API error',
          message: error.message,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get conversation ID from query params
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    // Fetch messages for conversation
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversationId', conversationId)
      .eq('userId', user.id)
      .order('createdAt', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      conversationId,
      messages: messages || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

