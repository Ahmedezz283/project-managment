import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from './task.controller.js';
import { TaskService } from './task.service.js';
import { Task } from './task-entity.js';
import { UserModule } from '../user/user.module.js';
import { AuthModule } from '../auth/auth-module.js';
import { ProjectModule } from '../project/project.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    UserModule,
    AuthModule,
    ProjectModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}