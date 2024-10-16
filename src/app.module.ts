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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, rabbitConfig],
    }),
    PrismaModule,
    CategoryModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule { }
