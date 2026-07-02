/**
 * Links Domain - Entity
 * Bookmarked links with metadata
 */

import { AggregateRoot, UUID, InvalidEntityException, DomainEvent } from '../shared/types';

export type LinkId = UUID;

export interface LinkProps {
  id: LinkId;
  userId: UUID;
  url: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Link implements AggregateRoot<LinkId> {
  private domainEvents: DomainEvent[] = [];

  private constructor(private props: LinkProps) {
    this.validate();
  }

  static create(
    id: LinkId,
    userId: UUID,
    url: string,
    name: string,
    description: string = '',
    category: string = 'general',
    tags: string[] = []
  ): Link {
    return new Link({
      id,
      userId,
      url,
      name,
      description,
      category,
      tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: LinkProps): Link {
    return new Link(props);
  }

  private validate(): void {
    if (!this.isValidUrl(this.props.url)) {
      throw new InvalidEntityException('Invalid URL format');
    }
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new InvalidEntityException('Link name cannot be empty');
    }
    if (this.props.name.length > 255) {
      throw new InvalidEntityException('Link name must be 255 characters or less');
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  updateUrl(newUrl: string): void {
    if (!this.isValidUrl(newUrl)) {
      throw new InvalidEntityException('Invalid URL format');
    }
    this.props.url = newUrl;
    this.props.updatedAt = new Date();
  }

  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new InvalidEntityException('Link name cannot be empty');
    }
    this.props.name = newName;
    this.props.updatedAt = new Date();
  }

  updateDescription(newDescription: string): void {
    this.props.description = newDescription;
    this.props.updatedAt = new Date();
  }

  updateCategory(newCategory: string): void {
    this.props.category = newCategory;
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

  removeTag(tag: string): void {
    this.props.tags = this.props.tags.filter(t => t !== tag);
    this.props.updatedAt = new Date();
  }

  // Getters
  getId(): LinkId {
    return this.props.id;
  }

  getUserId(): UUID {
    return this.props.userId;
  }

  getUrl(): string {
    return this.props.url;
  }

  getName(): string {
    return this.props.name;
  }

  getDescription(): string {
    return this.props.description;
  }

  getCategory(): string {
    return this.props.category;
  }

  getTags(): string[] {
    return [...this.props.tags];
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
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

  toJSON(): LinkProps {
    return {
      ...this.props,
      tags: [...this.props.tags],
    };
  }
}

