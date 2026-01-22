import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { JobsService } from './jobs.service';
import { DatabaseService } from '../database/database.service';

// Mock Orchestrator
jest.mock('@repo/orchestrator', () => ({
  WorkflowOrchestrator: class {
    static events = { on: jest.fn(), off: jest.fn(), emit: jest.fn() };
    executeWorkflow = jest.fn().mockResolvedValue({ id: 'test_job' });
  }
}));

describe('JobsService', () => {
  let service: JobsService;
  let database: DatabaseService;

  const mockPrisma = {
    videoJob: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: DatabaseService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    database = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should call prisma.videoJob.findMany', async () => {
      mockPrisma.videoJob.findMany.mockResolvedValue([]);
      const result = await service.findAll({});
      expect(result).toEqual([]);
      expect(mockPrisma.videoJob.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a job if found', async () => {
      const mockJob = { id: '1' };
      mockPrisma.videoJob.findUnique.mockResolvedValue(mockJob);
      const result = await service.findOne('1');
      expect(result).toEqual(mockJob);
    });
  });

  describe('generate', () => {
    it('should return a starting message', async () => {
      const result = await service.generate('Test Topic');
      expect(result.message).toBe('Generation started');
      expect(result.topic).toBe('Test Topic');
    });
  });
});
