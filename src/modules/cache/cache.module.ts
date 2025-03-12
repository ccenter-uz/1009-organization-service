import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    CacheModule.register(),
  ],
  providers: [
    CacheService,
   
  ],
  exports: [CacheService,],
})
export class CacheRedisModule {}
