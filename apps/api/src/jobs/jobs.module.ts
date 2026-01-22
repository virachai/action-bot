import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { ScriptsController } from './scripts.controller';

@Module({
  controllers: [JobsController, ScriptsController],
  providers: [JobsService],
})
export class JobsModule {}
