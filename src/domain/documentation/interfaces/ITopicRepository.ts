/**
 * Documentation Domain - Repository Interface
 */

import { Topic, TopicId } from '../entities/Topic';
import { Repository, UUID } from '../../shared/types';

export interface ITopicRepository extends Repository<Topic> {
  findByProjectId(projectId: UUID): Promise<Topic[]>;
  findBySlug(slug: string, projectId: UUID): Promise<Topic | null>;
  findAllForProject(projectId: UUID): Promise<Topic[]>;
  findByProjectIdOrdered(projectId: UUID): Promise<Topic[]>;
}

export const ITopicRepositoryToken = Symbol('ITopicRepository');

