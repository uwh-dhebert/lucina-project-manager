/**
 * Infrastructure Layer - Prisma Project Repository
 */

import { PrismaClient } from '@prisma/client';
import { Project, ProjectId } from '@/src/domain/projects/entities/Project';
import { IProjectRepository } from '@/src/domain/projects/interfaces/IProjectRepository';
import { UUID, EntityNotFoundException } from '@/src/domain/shared/types';

export class PrismaProjectRepository implements IProjectRepository {
  constructor(private prisma: PrismaClient) {}

  async save(project: Project): Promise<void> {
    const props = project.toJSON();

    await this.prisma.project.upsert({
      where: { id: props.id },
      update: {
        name: props.name,
        slug: props.slug,
        description: props.description,
        updatedAt: props.updatedAt,
      },
      create: {
        id: props.id,
        ownerId: props.ownerId,
        name: props.name,
        slug: props.slug,
        description: props.description,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
      },
    });
  }

  async findById(id: UUID): Promise<Project | null> {
    const data = await this.prisma.project.findUnique({
      where: { id: id as string },
    });

    if (!data) return null;

    return Project.restore({
      id: data.id as ProjectId,
      ownerId: data.ownerId as UUID,
      name: data.name,
      slug: data.slug,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async delete(id: UUID): Promise<void> {
    await this.prisma.project.delete({
      where: { id: id as string },
    });
  }

  async findByOwnerId(ownerId: UUID): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { ownerId: ownerId as string },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map(data =>
      Project.restore({
        id: data.id as ProjectId,
        ownerId: data.ownerId as UUID,
        name: data.name,
        slug: data.slug,
        description: data.description,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
    );
  }

  async findBySlug(slug: string, ownerId: UUID): Promise<Project | null> {
    const data = await this.prisma.project.findFirst({
      where: {
        slug,
        ownerId: ownerId as string,
      },
    });

    if (!data) return null;

    return Project.restore({
      id: data.id as ProjectId,
      ownerId: data.ownerId as UUID,
      name: data.name,
      slug: data.slug,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findAllForUser(userId: UUID): Promise<Project[]> {
    return this.findByOwnerId(userId);
  }
}

