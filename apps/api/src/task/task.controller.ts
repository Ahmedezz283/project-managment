import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service.js';
import { Task } from './task-entity.js';
import { CreateTaskDto } from './dto/create-task-dto.js';
import { UpdateTaskDto } from './dto/update-task-dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('projects/:projectId/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  findAll(): Promise<Task[]> {
    return this.taskService.findAll();
  }

  @Get('by-project')
  findAllByProject(@Param('projectId', ParseIntPipe) projectId: number): Promise<Task[]> {
    return this.taskService.findAllByProject(projectId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    return this.taskService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  async create(@Param('projectId', ParseIntPipe) projectId: number,@Body() createTaskDto: CreateTaskDto,@CurrentUser() user: AuthenticatedUser,
  ) {
    return this.taskService.create(projectId, createTaskDto, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  update(@Param('id', ParseIntPipe) id: number,@CurrentUser() user: AuthenticatedUser,@Body() updateTaskDto: UpdateTaskDto,): Promise<Task> {
    return this.taskService.update(id, user, updateTaskDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  remove(@Param('id', ParseIntPipe) id: number,@CurrentUser() user: AuthenticatedUser,): Promise<void> {
    return this.taskService.remove(id, user);
  }
}