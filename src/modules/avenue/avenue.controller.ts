import { Controller, Post, Get, Put, Delete, Patch } from '@nestjs/common';
import { AvenueService } from './avenue.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  AvenueCreateDto,
  AvenueUpdateDto,
  AvenueInterfaces,
  AvenueServiceCommands as Commands,
} from 'types/organization/avenue';
import { DeleteDto, GetOneDto, ListQueryDto } from 'types/global';
import { ListQueryWithOrderDto } from 'types/global/dto/list-query-with-order.dto';
import { CityRegionFilterDto } from 'types/global/dto/city-region-filter.dto';

@Controller('avenue')
export class AvenueController {
  constructor(private readonly avenueService: AvenueService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(@Payload() data: AvenueCreateDto): Promise<AvenueInterfaces.Response> {
    return this.avenueService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: CityRegionFilterDto
  ): Promise<AvenueInterfaces.ResponseWithoutPagination> {
    return this.avenueService.findAll(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<AvenueInterfaces.Response> {
    return this.avenueService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(@Payload() data: AvenueUpdateDto): Promise<AvenueInterfaces.Response> {
    return this.avenueService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<AvenueInterfaces.Response> {
    return this.avenueService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<AvenueInterfaces.Response> {
    return this.avenueService.restore(data);
  }
}
