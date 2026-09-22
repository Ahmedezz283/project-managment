import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTaskController } from './user-task.controller.js';
import { UserTaskService } from './user-task.service.js';
import { UserTask } from './user-task-entity.js';
import { UserModule } from '../user/user.module.js';
import { MessagingModule } from '../messaging/messaging.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserTask]), UserModule, MessagingModule],
  controllers: [UserTaskController],
  providers: [UserTaskService],
})
export class UserTaskModule {}