import { Module } from '@nestjs/common';
import { AdditionalCategoryController } from './additional-category.controller';
import { AdditionalCategoryService } from './additional-category.service';

@Module({
  controllers: [AdditionalCategoryController],
  providers: [AdditionalCategoryService],
  exports: [AdditionalCategoryService],
})
export class AdditionalCategoryModule {}
