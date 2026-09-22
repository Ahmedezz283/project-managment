import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UserModule } from './user/user.module.js';
import { ProjectModule } from './project/project.module.js';
import { TaskModule } from './task/task.module.js';
import { UserTaskModule } from './user-task/user-task.module.js';
import { User } from './user/user.entity.js';
import { Project } from './project/project.entity.js';
import { Task } from './task/task-entity.js';
import { UserTask } from './user-task/user-task-entity.js';
import { AuthModule } from './auth/auth-module.js';
import { MessagingModule } from './messaging/messaging.module.js';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') ?? '5432', 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, Project, Task, UserTask],
        synchronize: true,
      }),
    }),
    UserModule,
    AuthModule,
    ProjectModule,
    TaskModule,
    UserTaskModule,
    MessagingModule,
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}