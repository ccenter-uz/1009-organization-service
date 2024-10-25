import { Module } from '@nestjs/common';
import { MainOrganizationController } from './main-organization.controller';
import { MainOrganizationService } from './main-organization.service';

@Module({
  controllers: [MainOrganizationController],
  providers: [MainOrganizationService],
  exports: [MainOrganizationService],
})
export class MainOrganizationModule { }
