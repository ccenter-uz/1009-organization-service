import { Controller, Post, Get, Put, Delete, Patch } from '@nestjs/common';
import { NeighborhoodService } from './neighborhood.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  NeighborhoodCommands as Commands,
  NeighborhoodCreateDto,
  NeighborhoodUpdateDto,
  NeighborhoodInterfaces
} from 'types/organization/neighborhood';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import { CityRegionFilterDto } from 'types/global/dto/city-region-filter.dto';

@Controller('neighborhood')
export class NeighborhoodController {
  constructor(private readonly residentialAreaService: NeighborhoodService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: NeighborhoodCreateDto
  ): Promise<NeighborhoodInterfaces.Response> {
    return this.residentialAreaService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: CityRegionFilterDto
  ): Promise<NeighborhoodInterfaces.ResponseWithoutPagination> {
    return this.residentialAreaService.findAll(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(
    @Payload() data: GetOneDto
  ): Promise<NeighborhoodInterfaces.Response> {
    return this.residentialAreaService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: NeighborhoodUpdateDto
  ): Promise<NeighborhoodInterfaces.Response> {
    return this.residentialAreaService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(
    @Payload() data: DeleteDto
  ): Promise<NeighborhoodInterfaces.Response> {
    return this.residentialAreaService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(
    @Payload() data: GetOneDto
  ): Promise<NeighborhoodInterfaces.Response> {
    return this.residentialAreaService.restore(data);
  }
}
