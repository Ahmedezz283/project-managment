import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTask } from './user-task-entity.js';
import { CreateUserTaskDto } from './dto/create-user-task-dto.js';
import { AssignTaskDto } from './dto/assign-task-dto.js';
import { NOTIFICATION_CLIENT, NOTIFICATION_PATTERNS, TaskAssignedEvent } from '../messaging/messaging.constants.js';

@Injectable()
export class UserTaskService {
  constructor(
    @InjectRepository(UserTask)
    private userTaskRepository: Repository<UserTask>,
    @Inject(NOTIFICATION_CLIENT)
    private notificationClient: ClientProxy,
  ) {}

  findAll(): Promise<UserTask[]> {
    return this.userTaskRepository.find({ relations: { user: true, task: true } });
  }

  async findOne(id: number): Promise<UserTask> {
    const userTask = await this.userTaskRepository.findOne({
      where: { id },
      relations: { user: true, task: true },
    });
    if (!userTask) {
      throw new NotFoundException(`UserTask with id ${id} not found`);
    }
    return userTask;
  }

  create(createUserTaskDto: CreateUserTaskDto): Promise<UserTask> {
    const userTask = this.userTaskRepository.create(createUserTaskDto);
    return this.userTaskRepository.save(userTask);
  }

  async remove(id: number): Promise<void> {
    const userTask = await this.findOne(id);
    await this.userTaskRepository.remove(userTask);
  }

  async assignTask(assignTaskDto: AssignTaskDto): Promise<UserTask> {
    const userTask = this.userTaskRepository.create(assignTaskDto);
    const savedUserTask = await this.userTaskRepository.save(userTask);
    const assignedTask = await this.findOne(savedUserTask.id);
    const event: TaskAssignedEvent = {
      userId: assignedTask.userId,
      taskId: assignedTask.taskId,
      taskTitle: assignedTask.task.title,
      recipient: 'user',
    };
    await firstValueFrom(this.notificationClient.emit(NOTIFICATION_PATTERNS.taskAssigned, event));
    return assignedTask;
  }
}