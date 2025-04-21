import { Module, forwardRef } from '@nestjs/common';
import { SubCategoryController } from './sub-category.controller';
import { SubCategoryService } from './sub-category.service';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [forwardRef(() => CategoryModule)],
  controllers: [SubCategoryController],
  providers: [SubCategoryService],
  exports: [SubCategoryService],
})
export class SubCategoryModule {}
