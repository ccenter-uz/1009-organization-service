import { Module } from '@nestjs/common';
import { siteStatisticsController } from './site-statistics.controller';
import { siteStatisticsService } from './site-statistics.service';

@Module({
  controllers: [siteStatisticsController],
  providers: [siteStatisticsService],
  exports: [siteStatisticsService],
})
export class siteStatisticsModule {}
