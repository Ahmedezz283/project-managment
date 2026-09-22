import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './project.controller.js';
import { ProjectService } from './project.service.js';
import { Project } from './project.entity.js';
import { UserModule } from '../user/user.module.js';
import { AuthModule } from '../auth/auth-module.js';
import { MessagingModule } from '../messaging/messaging.module.js';
import { FlowableModule } from '../flowable/flowable-module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), UserModule, AuthModule, MessagingModule, FlowableModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}