/**
 * Application Layer - Create Topic Use Case
 */

import { UseCase, UUID, createUUID, EntityNotFoundException } from '@/src/domain/shared/types';
import { Topic } from '@/src/domain/documentation/entities/Topic';
import type { ITopicRepository } from '@/src/domain/documentation/interfaces/ITopicRepository';
import type { IProjectRepository } from '@/src/domain/projects/interfaces/IProjectRepository';
import { CreateTopicDTO, TopicResponseDTO } from '../dto';

export class CreateTopicUseCase implements UseCase<CreateTopicUseCaseInput, TopicResponseDTO> {
  constructor(
    private topicRepository: ITopicRepository,
    private projectRepository: IProjectRepository
  ) {}

  async execute(input: CreateTopicUseCaseInput): Promise<TopicResponseDTO> {
    // Verify project exists
    const projectId = createUUID(input.dto.projectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new EntityNotFoundException('Project', projectId);
    }

    const topicId = createUUID(this.generateId());
    const order = input.dto.order ?? 0;

    const topic = Topic.create(
      topicId,
      projectId,
      input.dto.title,
      order,
      input.dto.content
    );

    await this.topicRepository.save(topic);

    return this.mapToDTO(topic);
  }

  private generateId(): string {
    return `topic_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private mapToDTO(topic: Topic): TopicResponseDTO {
    const props = topic.toJSON();
    return {
      id: props.id,
      projectId: props.projectId,
      title: props.title,
      slug: props.slug,
      content: props.content,
      order: props.order,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}

export interface CreateTopicUseCaseInput {
  userId: UUID;
  dto: CreateTopicDTO;
}

