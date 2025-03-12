import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfig,
  dbConfig,
  rabbitConfig,
} from './common/config/configuration';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';
import { AllExceptionFilter } from './common/filter/all-exception.filter';
import { PrismaModule } from './modules/prisma/prisma.module';
import { CategoryModule } from './modules/category/category.module';
import { SubCategoryModule } from './modules/sub-category/sub-category.module';
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
import { FtpModule } from './modules/ftp/ftp.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronJobModule } from './common/cron/cron.module';
import { AdditionalCategoryModule } from './modules/additional-category/additional-category.module';
import { AdditionalModule } from './modules/additional/additional.module';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { NeighborhoodModule } from './modules/neighborhood/neighborhood.module';
import { CacheRedisModule } from './modules/cache/cache.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, rabbitConfig],
    }),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      isGlobal: true,
    }),

    
    ScheduleModule.forRoot(),
    PrismaModule,
    CacheRedisModule,
    CategoryModule,
    SubCategoryModule,
    MainOrganizationModule,
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
    NeighborhoodModule,
    ImpasseModule,
    VillageModule,
    LaneModule,
    StreetModule,
    OrganizationModule,
    OrganizationVersionModule,
    PhoneTypeModule,
    FtpModule,
    AdditionalCategoryModule,
    AdditionalModule,
    MonitoringModule,
    // CronJobModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {}
