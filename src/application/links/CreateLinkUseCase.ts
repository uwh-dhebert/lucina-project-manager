/**
 * Application Layer - Create Link Use Case
 */

import { UseCase, UUID, createUUID } from '@/src/domain/shared/types';
import { Link } from '@/src/domain/links/entities/Link';
import type { ILinkRepository } from '@/src/domain/links/interfaces/ILinkRepository';
import { CreateLinkDTO, LinkResponseDTO } from '../dto';

export class CreateLinkUseCase implements UseCase<CreateLinkUseCaseInput, LinkResponseDTO> {
  constructor(private linkRepository: ILinkRepository) {}

  async execute(input: CreateLinkUseCaseInput): Promise<LinkResponseDTO> {
    const linkId = createUUID(this.generateId());

    const link = Link.create(
      linkId,
      input.userId,
      input.dto.url,
      input.dto.name,
      input.dto.description,
      input.dto.category,
      input.dto.tags
    );

    await this.linkRepository.save(link);

    return this.mapToDTO(link);
  }

  private generateId(): string {
    return `link_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private mapToDTO(link: Link): LinkResponseDTO {
    const props = link.toJSON();
    return {
      id: props.id,
      url: props.url,
      name: props.name,
      description: props.description,
      category: props.category,
      tags: props.tags,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}

export interface CreateLinkUseCaseInput {
  userId: UUID;
  dto: CreateLinkDTO;
}

