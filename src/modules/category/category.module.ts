import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CacheRedisModule } from '../cache/cache.module';

@Module({
  imports : [CacheRedisModule],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService, ],
})
export class CategoryModule {}
