import { Module } from '@nestjs/common';
import { NearbyController } from './nearby.controller';
import { NearbyService } from './nearby.service';
import { CityModule } from '../city/city.module';
import { RegionModule } from '../region/region.module';
import { NearbyCategoryModule } from '../nearby-category/nearby-category.module';

@Module({
  imports: [CityModule, RegionModule, NearbyCategoryModule],
  controllers: [NearbyController],
  providers: [NearbyService],
  exports: [NearbyService],
})
export class NearbyModule {}
