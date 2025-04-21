import { Module, forwardRef } from '@nestjs/common';
import { ProductServiceCategoryController } from './product-service-category.controller';
import { ProductServiceCategoryService } from './product-service-category.service';
import { ProductServiceSubCategoryModule } from '../product-service-sub-category/product-service-sub-category.module';

@Module({
  imports: [
    forwardRef(() => ProductServiceSubCategoryModule),
    // ProductServiceSubCategoryModule,
  ],
  controllers: [ProductServiceCategoryController],
  providers: [ProductServiceCategoryService],
  exports: [ProductServiceCategoryService],
})
export class ProductServiceCategoryModule {}
