import { Module } from '@nestjs/common';
import { PhoneTypeController } from './phone-type.controller';
import { PhoneTypeService } from './phone-type.service';

@Module({
  controllers: [PhoneTypeController],
  providers: [PhoneTypeService],
  exports: [PhoneTypeService],
})
export class PhoneTypeModule {}
