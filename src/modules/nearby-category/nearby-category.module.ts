import { Module } from '@nestjs/common';
import { NearbyCategoryController } from './nearby-category.controller';
import { NearbyCategoryService } from './nearby-category.service';

@Module({
  controllers: [NearbyCategoryController],
  providers: [NearbyCategoryService],
  exports: [NearbyCategoryService],
})
export class NearbyCategoryModule {}
