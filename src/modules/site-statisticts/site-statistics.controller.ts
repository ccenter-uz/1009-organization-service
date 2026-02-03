import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { siteStatisticsService } from './site-statistics.service';

import {
  siteStatisticsCreateDto,
  siteStatisticsInterfaces,
  siteStatisticsCommands as Commands,
  GetSiteStatisticsDto,
} from 'types/organization/site-statistics';

@Controller('site-Statistics')
export class siteStatisticsController {
  constructor(private readonly siteStatisticsService: siteStatisticsService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: siteStatisticsCreateDto
  ): Promise<siteStatisticsInterfaces.Response> {
    return this.siteStatisticsService.create(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(
    @Payload() data: GetSiteStatisticsDto
  ): Promise<siteStatisticsInterfaces.Response> {
    return this.siteStatisticsService.findOne(data);
  }
}
