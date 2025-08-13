import { Module, forwardRef } from '@nestjs/common';
import { OrganizationVersionService } from './organization-version.service';
import { OrganizationVersionController } from './organization-version.controller';
import { CityModule } from '../city/city.module';
import { DistrictModule } from '../district/district.module';
import { RegionModule } from '../region/region.module';
import { MainOrganizationModule } from '../main-organization/main-organization.module';
import { SubCategoryModule } from '../sub-category/sub-category.module';
import { ProductServiceCategoryModule } from '../product-servise-category/product-service-category.module';
import { ProductServiceSubCategoryModule } from '../product-service-sub-category/product-service-sub-category.module';
import { VillageModule } from '../village/village.module';
import { AvenueModule } from '../avenue/avenue.module';
import { ResidentialAreaModule } from '../residential-area/residential-area.module';
import { AreaModule } from '../area/area.module';
import { StreetModule } from '../street/street.module';
import { LaneModule } from '../lane/lane.module';
import { ImpasseModule } from '../impasse/impasse.module';
import { NearbyModule } from '../nearby/nearby.module';
import { SegmentModule } from '../segment/segment.module';
import { PhoneTypeModule } from '../phone-type/phone-type.module';
import { OrganizationModule } from '../organization/organization.module';
import { NeighborhoodModule } from '../neighborhood/neighborhood.module';
// import { BusinessModule } from '../business/business.module';

@Module({
  imports: [
    // OrganizationModule,
    forwardRef(() => OrganizationModule),
    MainOrganizationModule,
    SubCategoryModule,
    ProductServiceCategoryModule,
    ProductServiceSubCategoryModule,
    CityModule,
    DistrictModule,
    RegionModule,
    VillageModule,
    AvenueModule,
    ResidentialAreaModule,
    AreaModule,
    StreetModule,
    LaneModule,
    ImpasseModule,
    NearbyModule,
    SegmentModule,
    PhoneTypeModule,
    NeighborhoodModule,
    // BusinessModule, 
  ],
  controllers: [OrganizationVersionController],
  providers: [OrganizationVersionService],
  exports: [OrganizationVersionService],
})
export class OrganizationVersionModule {}
