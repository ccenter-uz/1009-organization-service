import { Module, forwardRef } from '@nestjs/common';
import { ProductServiceSubCategoryController } from './product-service-sub-category.controller';
import { ProductServiceSubCategoryService } from './product-service-sub-category.service';
import { ProductServiceCategoryModule } from '../product-servise-category/product-service-category.module';

@Module({
  imports: [
    forwardRef(() => ProductServiceCategoryModule),
    // ProductServiceCategoryModule,
  ],
  controllers: [ProductServiceSubCategoryController],
  providers: [ProductServiceSubCategoryService],
  exports: [ProductServiceSubCategoryService],
})
export class ProductServiceSubCategoryModule {}
