import { Module } from '@nestjs/common';
import { ProductServiceCategoryController } from './product-service-category.controller';
import { ProductServiceCategoryService } from './product-service-category.service';

@Module({
  controllers: [ProductServiceCategoryController],
  providers: [ProductServiceCategoryService],
  exports: [ProductServiceCategoryService],
})
export class ProductServiceCategoryModule {}
