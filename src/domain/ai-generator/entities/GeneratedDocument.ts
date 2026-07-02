/**
 * AI Generator Domain - GeneratedDocument Entity
 * Design documents generated using AI
 */

import { AggregateRoot, UUID, InvalidEntityException, DomainEvent } from '../../shared/types';

export type GeneratedDocumentId = UUID;
export type DocumentTemplate = 'dan-hebert' | 'custom' | 'design-doc' | 'implementation-plan';

export interface GeneratedDocumentProps {
  id: GeneratedDocumentId;
  projectId: UUID;
  userId: UUID;
  title: string;
  templateType: DocumentTemplate;
  content: string;
  sections: DocumentSection[];
  status: 'draft' | 'review' | 'approved';
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export class GeneratedDocument implements AggregateRoot<GeneratedDocumentId> {
  private domainEvents: DomainEvent[] = [];

  private constructor(private props: GeneratedDocumentProps) {
    this.validate();
  }

  static create(
    id: GeneratedDocumentId,
    projectId: UUID,
    userId: UUID,
    title: string,
    templateType: DocumentTemplate,
    content: string = '',
    sections: DocumentSection[] = []
  ): GeneratedDocument {
    return new GeneratedDocument({
      id,
      projectId,
      userId,
      title,
      templateType,
      content,
      sections,
      status: 'draft',
      generatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static restore(props: GeneratedDocumentProps): GeneratedDocument {
    return new GeneratedDocument(props);
  }

  private validate(): void {
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new InvalidEntityException('Document title cannot be empty');
    }
    if (this.props.title.length > 255) {
      throw new InvalidEntityException('Document title must be 255 characters or less');
    }
    if (!['dan-hebert', 'custom', 'design-doc', 'implementation-plan'].includes(this.props.templateType)) {
      throw new InvalidEntityException('Invalid template type');
    }
  }

  updateTitle(newTitle: string): void {
    if (!newTitle || newTitle.trim().length === 0) {
      throw new InvalidEntityException('Document title cannot be empty');
    }
    this.props.title = newTitle;
    this.props.updatedAt = new Date();
  }

  updateContent(newContent: string): void {
    this.props.content = newContent;
    this.props.updatedAt = new Date();
  }

  addSection(section: DocumentSection): void {
    const exists = this.props.sections.some(s => s.id === section.id);
    if (!exists) {
      this.props.sections.push(section);
      this.props.updatedAt = new Date();
    }
  }

  updateSection(sectionId: string, updates: Partial<DocumentSection>): void {
    const section = this.props.sections.find(s => s.id === sectionId);
    if (!section) {
      throw new InvalidEntityException(`Section ${sectionId} not found`);
    }
    Object.assign(section, updates);
    this.props.updatedAt = new Date();
  }

  removeSection(sectionId: string): void {
    this.props.sections = this.props.sections.filter(s => s.id !== sectionId);
    this.props.updatedAt = new Date();
  }

  moveToReview(): void {
    if (this.props.status !== 'draft') {
      throw new InvalidEntityException('Only draft documents can be moved to review');
    }
    this.props.status = 'review';
    this.props.updatedAt = new Date();
  }

  approve(): void {
    if (this.props.status !== 'review') {
      throw new InvalidEntityException('Only documents in review can be approved');
    }
    this.props.status = 'approved';
    this.props.updatedAt = new Date();
  }

  revertToDraft(): void {
    this.props.status = 'draft';
    this.props.updatedAt = new Date();
  }

  // Getters
  getId(): GeneratedDocumentId {
    return this.props.id;
  }

  getProjectId(): UUID {
    return this.props.projectId;
  }

  getUserId(): UUID {
    return this.props.userId;
  }

  getTitle(): string {
    return this.props.title;
  }

  getTemplateType(): DocumentTemplate {
    return this.props.templateType;
  }

  getContent(): string {
    return this.props.content;
  }

  getSections(): DocumentSection[] {
    return [...this.props.sections];
  }

  getStatus(): string {
    return this.props.status;
  }

  getGeneratedAt(): Date {
    return this.props.generatedAt;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  // Interface properties for Entity/AggregateRoot
  get id(): GeneratedDocumentId {
    return this.props.id;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isDraft(): boolean {
    return this.props.status === 'draft';
  }

  isInReview(): boolean {
    return this.props.status === 'review';
  }

  isApproved(): boolean {
    return this.props.status === 'approved';
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

  toJSON(): GeneratedDocumentProps {
    return {
      ...this.props,
      sections: [...this.props.sections],
    };
  }
}

