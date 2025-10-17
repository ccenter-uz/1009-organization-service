import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { siteStatisticsService } from './site-statistics.service';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import {
  siteStatisticsCreateDto,
  siteStatisticsInterfaces,
  siteStatisticsCommands as Commands,
} from 'types/organization/site-statistics';
import { ListQueryWithOrderDto } from 'types/global/dto/list-query-with-order.dto';

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
    @Payload() data: GetOneDto
  ): Promise<siteStatisticsInterfaces.Response> {
    return this.siteStatisticsService.findOne(data);
  }
}
