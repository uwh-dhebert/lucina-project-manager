/**
 * Application Layer - Create Project Use Case
 */

import { UseCase, UUID, createUUID } from '@/src/domain/shared/types';
import { Project } from '@/src/domain/projects/entities/Project';
import { IProjectRepository } from '@/src/domain/projects/interfaces/IProjectRepository';
import { CreateProjectDTO, ProjectResponseDTO } from '../dto';

export class CreateProjectUseCase implements UseCase<CreateProjectUseCaseInput, ProjectResponseDTO> {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(input: CreateProjectUseCaseInput): Promise<ProjectResponseDTO> {
    const projectId = createUUID(this.generateId());

    const project = Project.create(
      projectId,
      input.userId,
      input.dto.name,
      input.dto.description
    );

    await this.projectRepository.save(project);

    return this.mapToDTO(project);
  }

  private generateId(): string {
    return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private mapToDTO(project: Project): ProjectResponseDTO {
    const props = project.toJSON();
    return {
      id: props.id,
      name: props.name,
      slug: props.slug,
      description: props.description,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}

export interface CreateProjectUseCaseInput {
  userId: UUID;
  dto: CreateProjectDTO;
}

