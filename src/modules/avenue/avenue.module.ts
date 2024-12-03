import { Module } from '@nestjs/common';
import { AvenueService } from './avenue.service';
import { AvenueController } from './avenue.controller';
import { CityModule } from '../city/city.module';
import { DistrictModule } from '../district/district.module';
import { RegionModule } from '../region/region.module';

@Module({
  imports: [CityModule, DistrictModule, RegionModule],
  controllers: [AvenueController],
  providers: [AvenueService],
  exports: [AvenueService]
})
export class AvenueModule { }
