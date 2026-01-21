import { Controller, Get, Param, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobStatus } from '@repo/database';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: JobStatus,
  ): Promise<any> {
    return this.jobsService.findAll({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : 50, // Default 50
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('stats')
  async getStats() {
    return this.jobsService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.jobsService.findOne(id);
  }
}
