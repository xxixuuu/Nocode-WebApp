import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        framework: dto.framework || 'NEXTJS',
        userId,
      },
      include: {
        components: true,
        schemas: true,
        workflows: true,
        pages: true,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        components: true,
        schemas: true,
        workflows: true,
        pages: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      include: {
        components: {
          orderBy: { order: 'asc' },
        },
        schemas: {
          include: {
            fields: true,
          },
        },
        workflows: true,
        pages: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, userId: string, dto: UpdateProjectDto) {
    await this.findOne(id, userId); // Check ownership

    return this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        framework: dto.framework,
        status: dto.status,
      },
      include: {
        components: true,
        schemas: true,
        workflows: true,
        pages: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Check ownership

    return this.prisma.project.delete({
      where: { id },
    });
  }

  // Component operations
  async addComponent(projectId: string, userId: string, component: any) {
    await this.findOne(projectId, userId); // Check ownership

    return this.prisma.component.create({
      data: {
        ...component,
        projectId,
      },
    });
  }

  async updateComponent(componentId: string, data: any) {
    return this.prisma.component.update({
      where: { id: componentId },
      data,
    });
  }

  async deleteComponent(componentId: string) {
    return this.prisma.component.delete({
      where: { id: componentId },
    });
  }
}
