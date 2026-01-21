import { Module } from '@nestjs/common';

import { LinksModule } from './links/links.module';
import { DatabaseModule } from './database/database.module';
import { JobsModule } from './jobs/jobs.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [LinksModule, DatabaseModule, JobsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
