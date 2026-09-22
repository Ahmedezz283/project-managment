import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity.js';
import { Task } from '../task/task-entity.js';
import { CreateProjectDto } from './dto/create-project-dto.js';
import { UpdateProjectDto } from './dto/update-project-dto.js';
import { UserService } from '../user/user.service.js';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import { NOTIFICATION_CLIENT, NOTIFICATION_PATTERNS, ProjectCreatedEvent } from '../messaging/messaging.constants.js';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private userRepository: UserService,
    @Inject(NOTIFICATION_CLIENT)
    private notificationClient: ClientProxy,
  ) {}

  async findAll(): Promise<(Project & { taskCount: number })[]> {
    const { entities, raw } = await this.projectRepository
      .createQueryBuilder('project')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(task.id)', 'count')
          .from(Task, 'task')
          .where('task.projectId = project.id');
      }, 'taskCount')
      .getRawAndEntities();

    return entities.map((project, index) => ({
      ...project,
      taskCount: parseInt(raw[index]?.taskCount, 10) || 0,
    }));
  }

  async findOne(id: number): Promise<Project & { taskCount: number }> {
    const { entities, raw } = await this.projectRepository
      .createQueryBuilder('project')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(task.id)', 'count')
          .from(Task, 'task')
          .where('task.projectId = project.id');
      }, 'taskCount')
      .where('project.id = :id', { id })
      .getRawAndEntities();

    const project = entities[0];
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    return { ...project, taskCount: parseInt(raw[0]?.taskCount, 10) || 0 };
  }

  async create(createProjectDto: CreateProjectDto, user: AuthenticatedUser): Promise<Project> {
  try {
    const project = this.projectRepository.create({
      ...createProjectDto,
      ownerId: user.id,
    });
    const savedProject = await this.projectRepository.save(project);
    
    const event: ProjectCreatedEvent = {
      projectId: savedProject.id,
      projectName: savedProject.name,
      ownerId: savedProject.ownerId,
      recipient: 'all',
    };
    
    this.notificationClient.emit(NOTIFICATION_PATTERNS.projectCreated, event);

    return savedProject;
  } catch (error: any) {
    throw new InternalServerErrorException(
      error instanceof Error ? error.message : 'An error occurred while creating the project',
    );
  }
}

  async update(projectId: number, user: AuthenticatedUser, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const isOwner = project.ownerId === user.id;
    const isAdmin = user.roles?.includes('admin');

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You are not authorized to update this project because you are not the owner');
    }

    Object.assign(project, updateProjectDto);
    return await this.projectRepository.save(project);
  }

  async remove(projectId: number, user: AuthenticatedUser): Promise<{ message: string }> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const isOwner = project.ownerId === user.id;
    const isAdmin = user.roles?.includes('admin');

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You are not authorized to delete this project because you are not the owner');
    }

    await this.projectRepository.remove(project);
    return { message: `Project with ID ${projectId} deleted successfully` };
  }
}