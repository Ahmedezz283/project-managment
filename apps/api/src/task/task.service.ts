import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task-entity.js';
import { CreateTaskDto } from './dto/create-task-dto.js';
import { UpdateTaskDto } from './dto/update-task-dto.js';
import { ProjectService } from '../project/project.service.js';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private projectService: ProjectService,
  ) {}

  findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  async findAllByProject(projectId: number): Promise<Task[]> {
    return this.taskRepository.find({ where: { projectId } });
  }

  async create(projectId: number, createTaskDto: CreateTaskDto, user: AuthenticatedUser): Promise<Task> {
    const project = await this.projectService.findOne(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const isOwner = project.ownerId === user.id;
    const isAdmin = user.roles?.includes('admin');
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You are not authorized to create tasks in this project');
    }

    const task = this.taskRepository.create({ ...createTaskDto, projectId });
    return this.taskRepository.save(task);
  }

  async update(id: number, user: AuthenticatedUser, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: { project: true },
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    const isOwner = task.project?.ownerId === user.id;
    const isAdmin = user.roles?.includes('admin');

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You are not authorized to update this task because you are not the project owner',
      );
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: number, user: AuthenticatedUser): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: { project: true },
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    const isOwner = task.project?.ownerId === user.id;
    const isAdmin = user.roles?.includes('admin');

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You are not authorized to delete this task because you are not the project owner',
      );
    }

    await this.taskRepository.remove(task);
  }
}