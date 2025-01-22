import { Module } from '@nestjs/common';
import { AdditionalModule } from '../additional/additional.module';
import { AdditionalTableController } from './additional-table.controller';
import { AdditionalTableService } from './additional-table.service';

@Module({
  imports: [AdditionalModule],
  controllers: [AdditionalTableController],
  providers: [AdditionalTableService],
  exports: [AdditionalTableService],
})
export class AdditionalTableModule {}
