import { Module } from '@nestjs/common';
import { LaneService } from './lane.service';
import { LaneController } from './lane.controller';
import { CityModule } from '../city/city.module';
import { DistrictModule } from '../district/district.module';
import { RegionModule } from '../region/region.module';

@Module({
  imports: [CityModule, DistrictModule, RegionModule],
  controllers: [LaneController],
  providers: [LaneService],
  exports: [LaneService]
})
export class LaneModule { }
