/**
 * Projects Domain - Repository Interface
 */

import { Project, ProjectId } from '../entities/Project';
import { Repository, UUID } from '../../shared/types';

export interface IProjectRepository extends Repository<Project> {
  findByOwnerId(ownerId: UUID): Promise<Project[]>;
  findBySlug(slug: string, ownerId: UUID): Promise<Project | null>;
  findAllForUser(userId: UUID): Promise<Project[]>;
  findById(id: UUID): Promise<Project | null>;
}

export const IProjectRepositoryToken = Symbol('IProjectRepository');



