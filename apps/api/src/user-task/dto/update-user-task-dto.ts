import { PartialType } from '@nestjs/mapped-types';
import { CreateUserTaskDto } from './create-user-task-dto.js';

export class UpdateUserTaskDto extends PartialType(CreateUserTaskDto) {}