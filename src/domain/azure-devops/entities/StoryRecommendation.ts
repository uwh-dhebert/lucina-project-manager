/**
 * Azure DevOps Domain - StoryRecommendation Entity
 * AI recommendations for story sizing
 */

import { AggregateRoot, UUID, InvalidEntityException, DomainEvent } from '../../shared/types';

export type StoryRecommendationId = UUID;
export type StorySize = 'xs' | 'small' | 'medium' | 'large' | 'xl';

export interface StoryRecommendationProps {
  id: StoryRecommendationId;
  userId: UUID;
  projectId?: UUID;
  storyId: string;
  title: string;
  currentSize?: number;
  recommendedSize: StorySize;
  confidence: number;
  reasoning: string;
  recommendation: string;
  tags: string[];
  accepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class StoryRecommendation implements AggregateRoot<StoryRecommendationId> {
  private domainEvents: DomainEvent[] = [];

  private constructor(private props: StoryRecommendationProps) {
    this.validate();
  }

  static create(
    id: StoryRecommendationId,
    userId: UUID,
    storyId: string,
    title: string,
    recommendedSize: StorySize,
    confidence: number,
    reasoning: string,
    recommendation: string,
    tags: string[] = [],
    projectId?: UUID,
    currentSize?: number
  ): StoryRecommendation {
    return new StoryRecommendation({
      id,
      userId,
      projectId,
      storyId,
      title,
      currentSize,
      recommendedSize,
      confidence,
      reasoning,
      recommendation,
      tags,
      accepted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: StoryRecommendationProps): StoryRecommendation {
    return new StoryRecommendation(props);
  }

  private validate(): void {
    if (!this.props.storyId || this.props.storyId.trim().length === 0) {
      throw new InvalidEntityException('Story ID cannot be empty');
    }
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new InvalidEntityException('Story title cannot be empty');
    }
    const validSizes: StorySize[] = ['xs', 'small', 'medium', 'large', 'xl'];
    if (!validSizes.includes(this.props.recommendedSize)) {
      throw new InvalidEntityException('Invalid story size');
    }
    if (this.props.confidence < 0 || this.props.confidence > 1) {
      throw new InvalidEntityException('Confidence must be between 0 and 1');
    }
  }

  updateRecommendation(
    newSize: StorySize,
    newConfidence: number,
    newReasoning: string,
    newRecommendation: string
  ): void {
    if (newConfidence < 0 || newConfidence > 1) {
      throw new InvalidEntityException('Confidence must be between 0 and 1');
    }
    this.props.recommendedSize = newSize;
    this.props.confidence = newConfidence;
    this.props.reasoning = newReasoning;
    this.props.recommendation = newRecommendation;
    this.props.updatedAt = new Date();
  }

  accept(): void {
    this.props.accepted = true;
    this.props.updatedAt = new Date();
  }

  reject(): void {
    this.props.accepted = false;
    this.props.updatedAt = new Date();
  }

  updateTags(newTags: string[]): void {
    this.props.tags = newTags;
    this.props.updatedAt = new Date();
  }

  addTag(tag: string): void {
    if (!this.props.tags.includes(tag)) {
      this.props.tags.push(tag);
      this.props.updatedAt = new Date();
    }
  }

  // Getters
  getId(): StoryRecommendationId {
    return this.props.id;
  }

  getUserId(): UUID {
    return this.props.userId;
  }

  getProjectId(): UUID | undefined {
    return this.props.projectId;
  }

  getStoryId(): string {
    return this.props.storyId;
  }

  getTitle(): string {
    return this.props.title;
  }

  getCurrentSize(): number | undefined {
    return this.props.currentSize;
  }

  getRecommendedSize(): StorySize {
    return this.props.recommendedSize;
  }

  getConfidence(): number {
    return this.props.confidence;
  }

  getReasoning(): string {
    return this.props.reasoning;
  }

  getRecommendation(): string {
    return this.props.recommendation;
  }

  getTags(): string[] {
    return [...this.props.tags];
  }

  isAccepted(): boolean {
    return this.props.accepted;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  // Interface properties for Entity/AggregateRoot
  get id(): StoryRecommendationId {
    return this.props.id;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isHighConfidence(): boolean {
    return this.props.confidence >= 0.8;
  }

  isMediumConfidence(): boolean {
    return this.props.confidence >= 0.5 && this.props.confidence < 0.8;
  }

  isLowConfidence(): boolean {
    return this.props.confidence < 0.5;
  }

  hasSmallBias(): boolean {
    return ['xs', 'small'].includes(this.props.recommendedSize);
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

  toJSON(): StoryRecommendationProps {
    return {
      ...this.props,
      tags: [...this.props.tags],
    };
  }
}

