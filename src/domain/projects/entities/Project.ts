/**
 * Projects Domain - Entity
 * Core business logic for projects
 */

import { AggregateRoot, UUID, DomainEvent, InvalidEntityException } from '../shared/types';

export type ProjectId = UUID;

export interface ProjectProps {
  id: ProjectId;
  ownerId: UUID;
  name: string;
  slug: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Project implements AggregateRoot<ProjectId> {
  private domainEvents: DomainEvent[] = [];

  private constructor(private props: ProjectProps) {
    this.validate();
  }

  static create(
    id: ProjectId,
    ownerId: UUID,
    name: string,
    description: string
  ): Project {
    const slug = Project.generateSlug(name);

    return new Project({
      id,
      ownerId,
      name,
      slug,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: ProjectProps): Project {
    return new Project(props);
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new InvalidEntityException('Project name cannot be empty');
    }
    if (this.props.name.length > 255) {
      throw new InvalidEntityException('Project name must be 255 characters or less');
    }
    if (!this.props.slug || this.props.slug.trim().length === 0) {
      throw new InvalidEntityException('Project slug cannot be empty');
    }
  }

  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new InvalidEntityException('Project name cannot be empty');
    }
    this.props.name = newName;
    this.props.slug = Project.generateSlug(newName);
    this.props.updatedAt = new Date();
  }

  updateDescription(newDescription: string): void {
    this.props.description = newDescription;
    this.props.updatedAt = new Date();
  }

  // Getters
  getId(): ProjectId {
    return this.props.id;
  }

  getOwnerId(): UUID {
    return this.props.ownerId;
  }

  getName(): string {
    return this.props.name;
  }

  getSlug(): string {
    return this.props.slug;
  }

  getDescription(): string {
    return this.props.description;
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

  toJSON(): ProjectProps {
    return { ...this.props };
  }
}

