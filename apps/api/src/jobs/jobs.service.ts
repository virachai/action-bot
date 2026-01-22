import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@repo/database';
import { fromEvent, map, Observable } from 'rxjs';

@Injectable()
export class JobsService {
  constructor(private prisma: DatabaseService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.VideoJobWhereUniqueInput;
    where?: Prisma.VideoJobWhereInput;
    orderBy?: Prisma.VideoJobOrderByWithRelationInput;
  }): Promise<Array<Prisma.VideoJobGetPayload<{ include: { script: { include: { topic: true } } } }>>> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.videoJob.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        script: {
          include: {
            topic: true,
          }
        }
      }
    });
  }

  async findOne(id: string): Promise<Prisma.VideoJobGetPayload<{ include: { script: { include: { topic: true } } } }> | null> {
    return this.prisma.videoJob.findUnique({
      where: { id },
      include: {
        script: {
          include: {
            topic: true,
          }
        }
      }
    });
  }

  async getStats() {
    const total = await this.prisma.videoJob.count();
    const completed = await this.prisma.videoJob.count({
      where: { status: 'COMPLETED' },
    });
    const failed = await this.prisma.videoJob.count({
      where: { status: 'FAILED' },
    });
    const processing = await this.prisma.videoJob.count({
      where: { status: 'PROCESSING' },
    });
    const pending = await this.prisma.videoJob.count({
      where: { status: 'PENDING' },
    });

    return {
      total,
      completed,
      failed,
      processing,
      pending,
    };
  }

  async generate(topic: string) {
    const { WorkflowOrchestrator } = await import('@repo/orchestrator');
    const orchestrator = new WorkflowOrchestrator();
    // Non-blocking execution
    orchestrator.executeWorkflow(topic).catch((err) => {
      console.error(`Job generation failed for topic "${topic}":`, err);
    });
    return { message: 'Generation started', topic };
  }

  async retry(id: string) {
    const job = await this.findOne(id);
    if (!job) {
      throw new Error(`Job ${id} not found`);
    }
    if (job.status !== 'FAILED') {
      throw new Error(`Job ${id} is not in FAILED state`);
    }

    const { WorkflowOrchestrator } = await import('@repo/orchestrator');
    const orchestrator = new WorkflowOrchestrator();

    // In a real scenario, we might want to resume or re-run with same ID.
    // However, executeWorkflow creates a new ID.
    // For simplicity, we'll just start a new workflow with the same topic.
    const topic = job.script?.topic?.content || 'Unknown Topic';
    orchestrator.executeWorkflow(topic).catch((err) => {
      console.error(`Job retry failed for job "${id}":`, err);
    });

    return { message: 'Retry started', jobId: id };
  }

  async generateScript(topic: string) {
    const { WorkflowOrchestrator } = await import('@repo/orchestrator');
    const orchestrator = new WorkflowOrchestrator();

    // Create a new job record first
    const job = {
        id: `wf_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        state: 'IDLE' as any,
        topic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    // This will persist the job and generate the script
    const script = await orchestrator.generateScriptStep(job);
    return { jobId: job.id, script };
  }

  async assembleVideo(jobId: string, scriptId: string) {
    const { WorkflowOrchestrator } = await import('@repo/orchestrator');
    const orchestrator = new WorkflowOrchestrator();

    const jobData = await this.findOne(jobId);
    if (!jobData) throw new Error(`Job ${jobId} not found`);

    const scriptData = await this.prisma.script.findUnique({ where: { id: scriptId } });
    if (!scriptData) throw new Error(`Script ${scriptId} not found`);

    const job = {
        id: jobId,
        state: 'GENERATING_SCRIPT' as any, // resume from here
        topic: scriptData.title,
        scriptId: scriptId,
        createdAt: jobData.createdAt.toISOString(),
        updatedAt: new Date().toISOString(),
    };

    // Reconstruct script object for video engine (simplified for now)
    const script = {
        id: scriptId,
        topic: scriptData.title,
        // ... other fields might be needed depending on video engine requirements
    };

    const videoMetadata = await orchestrator.assembleVideoStep(job, script);
    return { jobId, videoMetadata };
  }

  async finalize(jobId: string, videoId: string) {
    const { WorkflowOrchestrator } = await import('@repo/orchestrator');
    const orchestrator = new WorkflowOrchestrator();

    const jobData = await this.findOne(jobId);
    if (!jobData) throw new Error(`Job ${jobId} not found`);

    const videoJob = await this.prisma.videoJob.findUnique({ where: { id: jobId } });

    const job = {
        id: jobId,
        state: 'ASSEMBLING_VIDEO' as any,
        videoId: videoId,
        createdAt: jobData.createdAt.toISOString(),
        updatedAt: new Date().toISOString(),
    };

    // Dummy video metadata for finalization (Sheets logging uses it)
    const videoMetadata = {
        id: videoId,
        outputUrl: `https://s3.amazonaws.com/videos/${videoId}.mp4`, // This should be real in production
        duration: 60,
        fileSize: 1024 * 1024 * 10,
    };

    await orchestrator.finalizeWorkflowStep(job, videoMetadata);
    return { jobId, status: 'COMPLETED' };
  }

  getEventStream(): Observable<any> {
    return new Observable((subscriber) => {
      void (async () => {
        try {
          const { WorkflowOrchestrator } = (await import('@repo/orchestrator')) as { WorkflowOrchestrator: any };
          const subscription = fromEvent(WorkflowOrchestrator.events as any, 'stateChange')
            .pipe(map((data) => ({ data })))
            .subscribe(subscriber);
          return () => subscription.unsubscribe();
        } catch (err) {
          subscriber.error(err);
        }
      })();
    });
  }
}
