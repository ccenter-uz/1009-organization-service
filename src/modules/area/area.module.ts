import { Module } from '@nestjs/common';
import { AreaService } from './area.service';
import { AreaController } from './area.controller';
import { CityModule } from '../city/city.module';
import { DistrictModule } from '../district/district.module';
import { RegionModule } from '../region/region.module';

@Module({
  imports: [CityModule, DistrictModule, RegionModule],
  controllers: [AreaController],
  providers: [AreaService],
  exports: [AreaService]
})
export class AreaModule { }
