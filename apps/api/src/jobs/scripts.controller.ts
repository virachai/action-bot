import { Controller, Get, Param, Query } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('scripts')
export class ScriptsController {
  constructor(private readonly prisma: DatabaseService) {}

  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<any> {
    return this.prisma.script.findMany({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : 50,
      include: {
        topic: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.prisma.script.findUnique({
      where: { id },
      include: {
        topic: true,
      },
    });
  }
}
