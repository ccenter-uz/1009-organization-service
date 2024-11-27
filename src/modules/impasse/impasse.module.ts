import { Module } from '@nestjs/common';
import { ImpasseService } from './impasse.service';
import { ImpasseController } from './impasse.controller';
import { CityModule } from '../city/city.module';
import { DistrictModule } from '../district/district.module';
import { RegionModule } from '../region/region.module';

@Module({
  imports: [CityModule, DistrictModule, RegionModule],
  controllers: [ImpasseController],
  providers: [ImpasseService],
  exports: [ImpasseService]
})
export class ImpasseModule { }
