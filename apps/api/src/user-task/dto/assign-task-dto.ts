import { IsInt } from 'class-validator';

export class AssignTaskDto {
  @IsInt()
  userId: number;

  @IsInt()
  taskId: number;
}