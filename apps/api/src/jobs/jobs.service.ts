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

  getEventStream(): Observable<any> {
    return new Observable((subscriber) => {
      (async () => {
        try {
          const { WorkflowOrchestrator } = await import('@repo/orchestrator');
          const subscription = fromEvent(WorkflowOrchestrator.events, 'stateChange')
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
