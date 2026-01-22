import { Controller, Get, Param, Query, Post, Body, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
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

  @Post('generate')
  async generate(@Body('topic') topic: string) {
    return this.jobsService.generate(topic);
  }

  @Post(':id/retry')
  async retry(@Param('id') id: string) {
    return this.jobsService.retry(id);
  }

  @Post('step-script')
  async stepScript(@Body('topic') topic: string) {
    return this.jobsService.generateScript(topic);
  }

  @Post(':id/step-video')
  async stepVideo(@Param('id') id: string, @Body('scriptId') scriptId: string) {
    return this.jobsService.assembleVideo(id, scriptId);
  }

  @Post(':id/step-finalize')
  async stepFinalize(@Param('id') id: string, @Body('videoId') videoId: string) {
    return this.jobsService.finalize(id, videoId);
  }

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return this.jobsService.getEventStream();
  }
}
