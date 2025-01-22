import { Module } from '@nestjs/common';
import { AdditionalController } from './additional.controller';
import { AdditionalService } from './additional.service';
import { AdditionalCategoryModule } from '../additional-category/additional-category.module';

@Module({
  imports: [AdditionalCategoryModule],
  controllers: [AdditionalController],
  providers: [AdditionalService],
  exports: [AdditionalService],
})
export class AdditionalModule {}
