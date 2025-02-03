import { Module } from '@nestjs/common';
import { AdditionalModule } from '../additional/additional.module';
import { AdditionalContentController } from './additional-content.controller';
import { AdditionalContentService } from './additional-content.service';

@Module({
  imports: [AdditionalModule],
  controllers: [AdditionalContentController],
  providers: [AdditionalContentService],
  exports: [AdditionalContentService],
})
export class AdditionalContentModule {}
