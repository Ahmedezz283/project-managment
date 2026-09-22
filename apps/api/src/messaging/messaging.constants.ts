export const NOTIFICATION_CLIENT = 'NOTIFICATION_CLIENT';

export const NOTIFICATION_PATTERNS = {
  projectCreated: 'project.created',
  taskAssigned: 'task.assigned',
} as const;

export interface ProjectCreatedEvent {
  projectId: number;
  projectName: string;
  ownerId: number;
  recipient: 'all';
}

export interface TaskAssignedEvent {
  userId: number;
  taskId: number;
  taskTitle: string;
  recipient: 'user';
}
