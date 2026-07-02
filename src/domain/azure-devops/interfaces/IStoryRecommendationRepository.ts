/**
 * Azure DevOps Domain - Repository Interface
 */

import { StoryRecommendation, StoryRecommendationId } from './entities/StoryRecommendation';
import { Repository, UUID } from '../shared/types';

export interface IStoryRecommendationRepository extends Repository<StoryRecommendation> {
  findByUserId(userId: UUID): Promise<StoryRecommendation[]>;
  findByProjectId(projectId: UUID): Promise<StoryRecommendation[]>;
  findByUserIdAndAccepted(userId: UUID, accepted: boolean): Promise<StoryRecommendation[]>;
  findByStoryId(storyId: string): Promise<StoryRecommendation | null>;
}

export const IStoryRecommendationRepository = Symbol('IStoryRecommendationRepository');

