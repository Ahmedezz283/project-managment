import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { NotificationsModule } from './notifications.module.js';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(NotificationsModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'project-manager.notifications',
      queueOptions: { durable: true },
      noAck: false,
    },
  });
  await app.listen();
  console.log('🐰 Notifications Microservice is listening to RabbitMQ');
}
bootstrap();