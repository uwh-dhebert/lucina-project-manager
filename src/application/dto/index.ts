/**
 * Application Layer - Data Transfer Objects
 */

// Project DTOs
export interface CreateProjectDTO {
  name: string;
  description: string;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
}

export interface ProjectResponseDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// Topic DTOs
export interface CreateTopicDTO {
  projectId: string;
  title: string;
  order?: number;
  content?: string;
}

export interface UpdateTopicDTO {
  title?: string;
  content?: string;
  order?: number;
}

export interface TopicResponseDTO {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Link DTOs
export interface CreateLinkDTO {
  url: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export interface UpdateLinkDTO {
  url?: string;
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export interface LinkResponseDTO {
  id: string;
  url: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Chat Message DTOs
export interface CreateChatMessageDTO {
  conversationId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  contextDocumentIds?: string[];
}

export interface ChatMessageResponseDTO {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  contextDocumentIds: string[];
  tokens?: number;
  model?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Generated Document DTOs
export interface CreateGeneratedDocumentDTO {
  projectId: string;
  title: string;
  templateType: 'dan-hebert' | 'custom' | 'design-doc' | 'implementation-plan';
  content?: string;
}

export interface GeneratedDocumentResponseDTO {
  id: string;
  projectId: string;
  title: string;
  templateType: string;
  content: string;
  status: 'draft' | 'review' | 'approved';
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Story Recommendation DTOs
export interface CreateStoryRecommendationDTO {
  storyId: string;
  title: string;
  currentSize?: number;
}

export interface StoryRecommendationResponseDTO {
  id: string;
  storyId: string;
  title: string;
  currentSize?: number;
  recommendedSize: 'xs' | 'small' | 'medium' | 'large' | 'xl';
  confidence: number;
  reasoning: string;
  recommendation: string;
  tags: string[];
  accepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

