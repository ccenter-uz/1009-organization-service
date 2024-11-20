import { Module } from '@nestjs/common';
import { DistrictController } from './district.controller';
import { DistrictService } from './district.service';
import { CityModule } from '../city/city.module';
import { RegionModule } from '../region/region.module';

@Module({
  imports: [CityModule, RegionModule],
  controllers: [DistrictController],
  providers: [DistrictService],
  exports: [DistrictService],
})
export class DistrictModule {}
