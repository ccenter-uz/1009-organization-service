import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { RegionModule } from '../region/region.module';
import { ClientsModule } from '@nestjs/microservices';
import { ORGANIZATION, USER, initRmqClient } from 'types/config';
import { RmqModule } from '../rmq/rmq.module';

@Module({
  imports: [RmqModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
