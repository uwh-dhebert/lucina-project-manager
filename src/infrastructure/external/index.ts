/**
 * Infrastructure Layer - External Service Interfaces
 */

export interface GrokChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  systemPrompt?: string;
}

export interface GrokChatResponse {
  id: string;
  content: string;
  tokens: {
    prompt: number;
    completion: number;
  };
  model: string;
}

export interface IGrokService {
  chat(request: GrokChatRequest): Promise<GrokChatResponse>;
  ragChat(
    request: GrokChatRequest,
    documentContexts: string[]
  ): Promise<GrokChatResponse>;
}

export const IGrokService = Symbol('IGrokService');

// Azure DevOps Service
export interface AzureDevOpsStory {
  id: string;
  title: string;
  description?: string;
  fields?: Record<string, any>;
}

export interface AzureDevOpsStoryResponse extends AzureDevOpsStory {
  recommendedSize: 'xs' | 'small' | 'medium' | 'large' | 'xl';
  confidence: number;
  reasoning: string;
}

export interface IAzureDevOpsService {
  fetchStories(projectName: string, teamName?: string): Promise<AzureDevOpsStory[]>;
  getStoryDetails(projectName: string, storyId: string): Promise<AzureDevOpsStory>;
  updateStorySize(projectName: string, storyId: string, size: number): Promise<void>;
}

export const IAzureDevOpsService = Symbol('IAzureDevOpsService');

// Document Storage Service
export interface IDocumentStorageService {
  upload(documentId: string, content: string): Promise<string>;
  download(documentId: string): Promise<string>;
  delete(documentId: string): Promise<void>;
  search(query: string): Promise<string[]>;
}

export const IDocumentStorageService = Symbol('IDocumentStorageService');

