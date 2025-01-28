import { Controller, Post, Get, Put, Delete, Patch } from '@nestjs/common';
import { LaneService } from './lane.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  LaneCreateDto,
  LaneUpdateDto,
  LaneInterfaces,
  LaneServiceCommands as Commands,
} from 'types/organization/lane';
import {
  DeleteDto,
  GetOneDto,
  ListQueryDto,
} from 'types/global';
import { ListQueryWithOrderDto } from 'types/global/dto/list-query-with-order.dto';

@Controller('lane')
export class LaneController {
  constructor(private readonly laneService: LaneService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(@Payload() data: LaneCreateDto): Promise<LaneInterfaces.Response> {
    return this.laneService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: ListQueryWithOrderDto
  ): Promise<LaneInterfaces.ResponseWithoutPagination> {
    return this.laneService.findAll(data);
  }


  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<LaneInterfaces.Response> {
    return this.laneService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(@Payload() data: LaneUpdateDto): Promise<LaneInterfaces.Response> {
    return this.laneService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<LaneInterfaces.Response> {
    return this.laneService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<LaneInterfaces.Response> {
    return this.laneService.restore(data);
  }
}
