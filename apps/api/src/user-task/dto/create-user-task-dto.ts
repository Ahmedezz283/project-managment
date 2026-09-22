import { IsInt, IsEnum, IsOptional } from 'class-validator';
import { TaskRole } from '../user-task-entity.js';

export class CreateUserTaskDto {
  @IsInt()
  userId: number;

  @IsInt()
  taskId: number;

  @IsEnum(TaskRole)
  @IsOptional()
  role?: TaskRole;
}