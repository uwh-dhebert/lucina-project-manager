/**
 * Links Domain - Repository Interface
 */

import { Link, LinkId } from './entities/Link';
import { Repository, UUID } from '../shared/types';

export interface ILinkRepository extends Repository<Link> {
  findByUserId(userId: UUID): Promise<Link[]>;
  findByUserIdAndCategory(userId: UUID, category: string): Promise<Link[]>;
  findByUserIdAndTags(userId: UUID, tags: string[]): Promise<Link[]>;
  findByCategory(category: string): Promise<Link[]>;
}

export const ILinkRepository = Symbol('ILinkRepository');

