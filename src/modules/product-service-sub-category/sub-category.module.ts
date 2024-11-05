import { Module } from '@nestjs/common';
import { ProductServiceSubCategoryController } from './sub-category.controller';
import { ProductServiceSubCategoryService } from './sub-category.service';
import { ProductServiceCategoryModule } from '../product-servise-category/product-service-category.module';

@Module({
  imports: [ProductServiceCategoryModule],
  controllers: [ProductServiceSubCategoryController],
  providers: [ProductServiceSubCategoryService],
  exports: [ProductServiceSubCategoryService],
})
export class ProductServiceSubCategoryModule {}
