import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import type { RmqContext } from '@nestjs/microservices';
import { NOTIFICATION_PATTERNS,} from './notifications.constants.js';
import type { ProjectCreatedEvent, TaskAssignedEvent } from './notifications.constants.js';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  @EventPattern(NOTIFICATION_PATTERNS.projectCreated)
  handleProjectCreated(@Payload() event: ProjectCreatedEvent, @Ctx() context: unknown): void {
    if (!event || !event.projectName) {
      this.logger.warn(`Received malformed project created event: ${JSON.stringify(event)}`);
      this.acknowledge(context);
      return;
    }

    this.logger.log(`Project "${event.projectName}" was created; notify all users.`);
    this.acknowledge(context);
  }

  @EventPattern(NOTIFICATION_PATTERNS.taskAssigned)
  handleTaskAssigned(@Payload() event: TaskAssignedEvent, @Ctx() context: unknown): void {
    if (!event || !event.taskTitle) {
      this.logger.warn(`Received malformed task assigned event: ${JSON.stringify(event)}`);
      this.acknowledge(context);
      return;
    }

    this.logger.log(`Task "${event.taskTitle}" was assigned to user ${event.userId}.`);
    this.acknowledge(context);
  }

  private acknowledge(context: unknown): void {
    const rmqContext = context as RmqContext;
    const channel = rmqContext.getChannelRef();
    const message = rmqContext.getMessage();
    channel.ack(message);
  }
}