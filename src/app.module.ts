import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfig,
  dbConfig,
  rabbitConfig,
} from './common/config/configuration';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionFilter } from './common/filter/all-exception.filter';
import { PrismaModule } from './modules/prisma/prisma.module';
import { CategoryModule } from './modules/category/category.module';
import { SubCategoryModule } from './modules/sub-category/sub-category.module';
import { SectionModule } from './modules/section/section.module';
import { SegmentModule } from './modules/segment/segment.module';
import { ProductServiceCategoryModule } from './modules/product-servise-category/product-service-category.module';
import { ProductServiceSubCategoryModule } from './modules/product-service-sub-category/product-service-sub-category.module';
import { RegionModule } from './modules/region/region.module';
import { CityModule } from './modules/city/city.module';
import { DistrictModule } from './modules/district/district.module';
import { NearbyCategoryModule } from './modules/nearby-category/nearby-category.module';
import { NearbyModule } from './modules/nearby/nearby.module';
import { MainOrganizationModule } from './modules/main-organization/main-organization.module';
import { PassageModule } from './modules/passage/passage.module';
import { AreaModule } from './modules/area/area.module';
import { AvenueModule } from './modules/avenue/avenue.module';
import { ResidentialAreaModule } from './modules/residential-area/residential-area.module';
import { ImpasseModule } from './modules/impasse/impasse.module';
import { VillageModule } from './modules/village/village.module';
import { LaneModule } from './modules/lane/lane.module';
import { StreetModule } from './modules/street/street.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { OrganizationVersionModule } from './modules/organization-version/organization-version.module';
import { PhoneTypeModule } from './modules/phone-type/phone-type.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, rabbitConfig],
    }),
    PrismaModule,
    CategoryModule,
    SubCategoryModule,
    MainOrganizationModule,
    SectionModule,
    SegmentModule,
    ProductServiceCategoryModule,
    ProductServiceSubCategoryModule,
    RegionModule,
    CityModule,
    DistrictModule,
    NearbyCategoryModule,
    NearbyModule,
    PassageModule,
    AreaModule,
    AvenueModule,
    ResidentialAreaModule,
    ImpasseModule,
    VillageModule,
    LaneModule,
    StreetModule,
    OrganizationModule,
    OrganizationVersionModule,
    PhoneTypeModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {}
