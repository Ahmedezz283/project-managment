import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserTaskService } from './user-task.service.js';
import { UserTask } from './user-task-entity.js';
import { NOTIFICATION_CLIENT } from '../messaging/messaging.constants.js';

describe('UserTaskService', () => {
  let service: UserTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserTaskService,
        { provide: getRepositoryToken(UserTask), useValue: {} },
        { provide: NOTIFICATION_CLIENT, useValue: { emit: vi.fn() } },
      ],
    }).compile();

    service = module.get<UserTaskService>(UserTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
