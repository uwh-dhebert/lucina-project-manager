/**
 * AI Generator Domain - Repository Interface
 */

import { GeneratedDocument, GeneratedDocumentId } from '../entities/GeneratedDocument';
import { Repository, UUID } from '../../shared/types';

export interface IGeneratedDocumentRepository extends Repository<GeneratedDocument> {
  findByProjectId(projectId: UUID): Promise<GeneratedDocument[]>;
  findByUserId(userId: UUID): Promise<GeneratedDocument[]>;
  findByProjectIdAndUserId(projectId: UUID, userId: UUID): Promise<GeneratedDocument[]>;
  findByStatus(status: 'draft' | 'review' | 'approved'): Promise<GeneratedDocument[]>;
}

export const IGeneratedDocumentRepositoryToken = Symbol('IGeneratedDocumentRepository');

