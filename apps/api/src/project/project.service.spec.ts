import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProjectService } from './project.service.js';
import { Project } from './project.entity.js';
import { UserService } from '../user/user.service.js';
import { NOTIFICATION_CLIENT } from '../messaging/messaging.constants.js';

describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: getRepositoryToken(Project), useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: NOTIFICATION_CLIENT, useValue: { emit: vi.fn() } },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
