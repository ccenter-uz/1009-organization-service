import { Module } from '@nestjs/common';
import { ResidentialAreaService } from './residential-area.service';
import { ResidentialAreaController } from './residential-area.controller';
import { CityModule } from '../city/city.module';
import { DistrictModule } from '../district/district.module';
import { RegionModule } from '../region/region.module';

@Module({
  imports: [CityModule, DistrictModule, RegionModule],
  controllers: [ResidentialAreaController],
  providers: [ResidentialAreaService],
  exports: [ResidentialAreaService]
})
export class ResidentialAreaModule { }
