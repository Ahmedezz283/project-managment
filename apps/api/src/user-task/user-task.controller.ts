import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UserTaskService } from './user-task.service.js';
import { UserTask } from './user-task-entity.js';
import { CreateUserTaskDto } from './dto/create-user-task-dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { AssignTaskDto } from './dto/assign-task-dto.js';

@Controller('user-tasks')
export class UserTaskController {
  constructor(private readonly userTaskService: UserTaskService) {}

  @Get()
  findAll(): Promise<UserTask[]> {
    return this.userTaskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserTask> {
    return this.userTaskService.findOne(id);
  }

  @Post()
  create(@Body() createUserTaskDto: CreateUserTaskDto): Promise<UserTask> {
    return this.userTaskService.create(createUserTaskDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userTaskService.remove(id);
  }

  @Post('assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  assignTask(@Body() assignTaskDto: AssignTaskDto): Promise<UserTask> {
    return this.userTaskService.assignTask(assignTaskDto);
  }
  
}