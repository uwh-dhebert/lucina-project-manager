/**
 * Documentation Domain - Topic Entity
 * Markdown-based wiki topics within projects
 */

import { AggregateRoot, UUID, InvalidEntityException, DomainEvent } from '../../shared/types';

export type TopicId = UUID;

export interface TopicProps {
  id: TopicId;
  projectId: UUID;
  title: string;
  slug: string;
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Topic implements AggregateRoot<TopicId> {
  private domainEvents: DomainEvent[] = [];

  private constructor(private props: TopicProps) {
    this.validate();
  }

  static create(
    id: TopicId,
    projectId: UUID,
    title: string,
    order: number,
    content: string = ''
  ): Topic {
    const slug = Topic.generateSlug(title);

    return new Topic({
      id,
      projectId,
      title,
      slug,
      content,
      order,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: TopicProps): Topic {
    return new Topic(props);
  }

  private validate(): void {
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new InvalidEntityException('Topic title cannot be empty');
    }
    if (this.props.title.length > 255) {
      throw new InvalidEntityException('Topic title must be 255 characters or less');
    }
    if (this.props.order < 0) {
      throw new InvalidEntityException('Topic order must be non-negative');
    }
  }

  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  updateTitle(newTitle: string): void {
    if (!newTitle || newTitle.trim().length === 0) {
      throw new InvalidEntityException('Topic title cannot be empty');
    }
    this.props.title = newTitle;
    this.props.slug = Topic.generateSlug(newTitle);
    this.props.updatedAt = new Date();
  }

  updateContent(newContent: string): void {
    this.props.content = newContent;
    this.props.updatedAt = new Date();
  }

  updateOrder(newOrder: number): void {
    if (newOrder < 0) {
      throw new InvalidEntityException('Topic order must be non-negative');
    }
    this.props.order = newOrder;
    this.props.updatedAt = new Date();
  }

  // Getters
  getId(): TopicId {
    return this.props.id;
  }

  getProjectId(): UUID {
    return this.props.projectId;
  }

  getTitle(): string {
    return this.props.title;
  }

  getSlug(): string {
    return this.props.slug;
  }

  getContent(): string {
    return this.props.content;
  }

  getOrder(): number {
    return this.props.order;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  // Interface properties for Entity/AggregateRoot
  get id(): TopicId {
    return this.props.id;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
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

  toJSON(): TopicProps {
    return { ...this.props };
  }
}

