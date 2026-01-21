import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@repo/database';

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
}
