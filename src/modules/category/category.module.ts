import { Module, forwardRef } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CacheRedisModule } from '../cache/cache.module';
import { SubCategoryModule } from '../sub-category/sub-category.module';

@Module({
  imports: [CacheRedisModule, forwardRef(() => SubCategoryModule)],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
