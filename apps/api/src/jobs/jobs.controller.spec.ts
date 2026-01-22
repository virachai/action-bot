import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

describe('JobsController', () => {
  let controller: JobsController;

  const mockJobsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    getStats: jest.fn(),
    generate: jest.fn(),
    retry: jest.fn(),
    getEventStream: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        {
          provide: JobsService,
          useValue: mockJobsService,
        },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll with default params', async () => {
      mockJobsService.findAll.mockResolvedValue([]);
      await controller.findAll();
      expect(mockJobsService.findAll).toHaveBeenCalledWith(expect.objectContaining({ take: 50 }));
    });
  });

  describe('generate', () => {
    it('should call service.generate with topic', async () => {
      const topic = 'Test AI';
      await controller.generate(topic);
      expect(mockJobsService.generate).toHaveBeenCalledWith(topic);
    });
  });
});
