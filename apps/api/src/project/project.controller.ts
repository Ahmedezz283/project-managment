import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service.js';
import { Project } from './project.entity.js';
import { CreateProjectDto } from './dto/create-project-dto.js';
import { UpdateProjectDto } from './dto/update-project-dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { FlowableService } from '../flowable/flowable-services.js';
import { NotFoundException } from '@nestjs/common';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService, private readonly flowableService: FlowableService) { }

  @Get()
  findAll(): Promise<Project[]> {
    return this.projectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Project> {
    return this.projectService.findOne(id);
  }

  // @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // // @Roles('manager')
  // create(@Body() createProjectDto: CreateProjectDto, @CurrentUser() user: AuthenticatedUser): Promise<Project> {
  //   return this.projectService.create(createProjectDto, user);
  // }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  async update(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser, @Body() updateProjectDto: UpdateProjectDto,) {
    return this.projectService.update(id, user, updateProjectDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser,): Promise<{ message: string }> {
    return this.projectService.remove(id, user);
  }

  @Post('flowable/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async submitProject(@Body() _dto: CreateProjectDto, @CurrentUser() user: AuthenticatedUser) {
    const instance = await this.flowableService.startProcess('a111', {
      role: user.roles.includes('manager') ? 'manager' : 'employee',
    });
    return { processInstanceId: instance.id };
  }

  @Post(':processInstanceId/approve')
  async approveProject(@Param('processInstanceId') id: string, @Body() dto: { request: "approve" }) {
    const task = await this.flowableService.getActiveTask(id);
    await this.flowableService.completeTask(task.id, { request: dto.request});
    return { status: 'ok' };
  }

}