import { Module } from '@nestjs/common';
import { CronJobService } from './cron.service';

@Module({
  controllers: [],
  providers: [CronJobService],
  exports: [CronJobService],
})
export class CronJobModule {}
