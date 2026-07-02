/**
 * Chat Domain - ChatMessage Entity
 * Messages for Grok chatbot with RAG support
 */

import { AggregateRoot, UUID, InvalidEntityException, DomainEvent } from '../shared/types';

export type ChatMessageId = UUID;
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessageProps {
  id: ChatMessageId;
  userId: UUID;
  conversationId: UUID;
  content: string;
  role: MessageRole;
  contextDocumentIds: UUID[];
  tokens?: number;
  model?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ChatMessage implements AggregateRoot<ChatMessageId> {
  private domainEvents: DomainEvent[] = [];

  private constructor(private props: ChatMessageProps) {
    this.validate();
  }

  static create(
    id: ChatMessageId,
    userId: UUID,
    conversationId: UUID,
    content: string,
    role: MessageRole,
    contextDocumentIds: UUID[] = []
  ): ChatMessage {
    return new ChatMessage({
      id,
      userId,
      conversationId,
      content,
      role,
      contextDocumentIds,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: ChatMessageProps): ChatMessage {
    return new ChatMessage(props);
  }

  private validate(): void {
    if (!this.props.content || this.props.content.trim().length === 0) {
      throw new InvalidEntityException('Chat message content cannot be empty');
    }
    if (!['user', 'assistant', 'system'].includes(this.props.role)) {
      throw new InvalidEntityException('Invalid message role');
    }
  }

  updateContent(newContent: string): void {
    if (!newContent || newContent.trim().length === 0) {
      throw new InvalidEntityException('Chat message content cannot be empty');
    }
    this.props.content = newContent;
    this.props.updatedAt = new Date();
  }

  addContextDocument(documentId: UUID): void {
    if (!this.props.contextDocumentIds.includes(documentId)) {
      this.props.contextDocumentIds.push(documentId);
      this.props.updatedAt = new Date();
    }
  }

  setTokenCount(tokens: number): void {
    this.props.tokens = tokens;
    this.props.updatedAt = new Date();
  }

  setModel(model: string): void {
    this.props.model = model;
    this.props.updatedAt = new Date();
  }

  // Getters
  getId(): ChatMessageId {
    return this.props.id;
  }

  getUserId(): UUID {
    return this.props.userId;
  }

  getConversationId(): UUID {
    return this.props.conversationId;
  }

  getContent(): string {
    return this.props.content;
  }

  getRole(): MessageRole {
    return this.props.role;
  }

  getContextDocumentIds(): UUID[] {
    return [...this.props.contextDocumentIds];
  }

  getTokens(): number | undefined {
    return this.props.tokens;
  }

  getModel(): string | undefined {
    return this.props.model;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  isUserMessage(): boolean {
    return this.props.role === 'user';
  }

  isAssistantMessage(): boolean {
    return this.props.role === 'assistant';
  }

  // Domain Events
  getDomainEvents(): DomainEvent[] {
    return this.domainEvents;
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  toJSON(): ChatMessageProps {
    return {
      ...this.props,
      contextDocumentIds: [...this.props.contextDocumentIds],
    };
  }
}

