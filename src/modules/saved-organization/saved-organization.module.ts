import { Module, forwardRef } from '@nestjs/common';
import { SavedOrganizationController } from './saved-organization.controller';
import { SavedOrganizationService } from './saved-organization.service';
import { CacheRedisModule } from '../cache/cache.module';

@Module({
  imports: [CacheRedisModule, ],
  controllers: [SavedOrganizationController],
  providers: [SavedOrganizationService],
  exports: [SavedOrganizationService],
})
export class SavedOrganizationModule {}
