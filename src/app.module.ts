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
import { MainOrganizationModule } from './modules/main-rganization/main-organization.module';
import { SectionModule } from './modules/section/section.module';
import { SegmentModule } from './modules/segment/segment.module';

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
