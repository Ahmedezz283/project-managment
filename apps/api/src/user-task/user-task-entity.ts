import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../user/user.entity.js';
import { Task } from '../task/task-entity.js';

export enum TaskRole {
  ASSIGNEE = 'assignee',
  REVIEWER = 'reviewer',
}

@Entity('user_tasks')
export class UserTask {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Column()
  userId: number;

  @ManyToOne(() => Task, (task) => task.userTasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Relation<Task>;

  @Column()
  taskId: number;

  @Column({
    type: 'enum',
    enum: TaskRole,
    default: TaskRole.ASSIGNEE,
  })
  role: TaskRole;

  @CreateDateColumn()
  assignedAt: Date;
}