/**
 * Domain Layer - Shared Types & Interfaces
 * Core domain model interfaces and types
 */

export type UUID = string & { readonly __brand: 'UUID' };

export function createUUID(id: string): UUID {
  return id as UUID;
}

export interface Entity<T extends UUID> {
  id: T;
  createdAt: Date;
  updatedAt: Date;
}

export interface AggregateRoot<T extends UUID> extends Entity<T> {
  getDomainEvents(): DomainEvent[];
  clearDomainEvents(): void;
}

export interface DomainEvent {
  aggregateId: UUID;
  occurredAt: Date;
  eventType: string;
}

export interface Repository<T extends Entity<any>> {
  save(entity: T): Promise<void>;
  findById(id: UUID): Promise<T | null>;
  delete(id: UUID): Promise<void>;
}

export interface UseCase<Input = void, Output = void> {
  execute(input: Input): Promise<Output>;
}

export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class InvalidEntityException extends DomainException {
  constructor(message: string) {
    super(`Invalid Entity: ${message}`);
    this.name = 'InvalidEntityException';
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: UUID) {
    super(`${entityName} with ID ${id} not found`);
    this.name = 'EntityNotFoundException';
  }
}

export class BusinessRuleViolation extends DomainException {
  constructor(message: string) {
    super(`Business Rule Violation: ${message}`);
    this.name = 'BusinessRuleViolation';
  }
}

