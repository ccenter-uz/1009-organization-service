import { Module } from '@nestjs/common';
import { TempCacheService } from './temp-cache.service';
import { TempCacheController } from './temp-cache.controller';
import { CacheRedisModule } from '../cache/cache.module';

@Module({
  imports: [CacheRedisModule],
  controllers: [TempCacheController],
  providers: [TempCacheService],
  exports: [TempCacheService],
})
export class TempCacheModule {}
