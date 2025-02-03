import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MonitoringService } from './monitoring.service';
import { MonitoringServiceCommands as Commands } from 'types/organization/monitoring';
import {
  MonitoringFilterDto,
  MonitoringInterfaces,
} from 'types/organization/monitoring';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  // @Post()
  // @MessagePattern({ cmd: Commands.CREATE })
  // create(
  //   @Payload() data: MainOrganizationCreateDto
  // ): Promise<MainOrganizationInterfaces.Response> {
  //   return this.categoryService.create(data);
  // }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: MonitoringFilterDto
  ): Promise<MonitoringInterfaces.ResponseWithoutPagination> {
    return this.monitoringService.findAll(data);
  }
}
