/**
 * Infrastructure Layer - Grok Service Implementation
 * Implements xAI Grok API integration for chatbot
 */

import { IGrokService, GrokChatRequest, GrokChatResponse } from './index';

export class GrokService implements IGrokService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private modelLite: string;

  constructor() {
    this.apiKey = process.env.XAI_API_KEY || '';
    this.baseUrl = process.env.XAI_BASE_URL || 'https://api.x.ai/v1';
    this.model = process.env.XAI_MODEL || 'grok-4-1-fast-reasoning';
    this.modelLite = process.env.XAI_MODEL_LITE || 'grok-4-1-fast-non-reasoning';

    if (!this.apiKey) {
      throw new Error('XAI_API_KEY environment variable is not set');
    }
  }

  async chat(request: GrokChatRequest): Promise<GrokChatResponse> {
    // Use lite model for chat by default
    const model = request.model || this.modelLite;
    return this.callGrokAPI(request, model);
  }

  async ragChat(
    request: GrokChatRequest,
    documentContexts: string[]
  ): Promise<GrokChatResponse> {
    // Inject document context into the system prompt for RAG
    const systemPrompt = this.buildRagSystemPrompt(
      request.systemPrompt,
      documentContexts
    );

    const ragRequest: GrokChatRequest = {
      ...request,
      systemPrompt,
      // Use full model for RAG with reasoning capability
      model: request.model || this.model,
    };

    return this.callGrokAPI(ragRequest, ragRequest.model || this.model);
  }

  private async callGrokAPI(
    request: GrokChatRequest,
    model: string
  ): Promise<GrokChatResponse> {
    const messages = request.messages;

    // Add system prompt if provided
    if (request.systemPrompt) {
      messages.unshift({
        role: 'system',
        content: request.systemPrompt,
      });
    }

    const payload = {
      messages,
      model,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 2048,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Grok API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const data = await response.json();

      // Parse response according to xAI API format
      return {
        id: data.id,
        content: data.choices?.[0]?.message?.content || '',
        tokens: {
          prompt: data.usage?.prompt_tokens || 0,
          completion: data.usage?.completion_tokens || 0,
        },
        model: model,
      };
    } catch (error) {
      throw new Error(`Failed to call Grok API: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private buildRagSystemPrompt(
    basePrompt: string | undefined,
    documentContexts: string[]
  ): string {
    const contextStr = documentContexts
      .map((doc, idx) => `[Document ${idx + 1}]\n${doc}`)
      .join('\n\n');

    const ragInstruction = `You are a helpful assistant. Use the following documents to answer questions accurately. If the answer is not in the documents, say so.

${contextStr}

---`;

    if (basePrompt) {
      return `${ragInstruction}\n\n${basePrompt}`;
    }

    return ragInstruction;
  }
}

