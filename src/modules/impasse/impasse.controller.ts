import { Controller, Post, Get, Put, Delete, Patch } from '@nestjs/common';
import { ImpasseService } from './impasse.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ImpasseCreateDto,
  ImpasseUpdateDto,
  ImpasseInterfaces,
  ImpasseServiceCommands as Commands,
} from 'types/organization/impasse';
import {
  DeleteDto,
  GetOneDto,
  ListQueryDto,
} from 'types/global';
import { ListQueryWithOrderDto } from 'types/global/dto/list-query-with-order.dto';

@Controller('impasse')
export class ImpasseController {
  constructor(private readonly impasseService: ImpasseService) { }

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: ImpasseCreateDto
  ): Promise<ImpasseInterfaces.Response> {
    return this.impasseService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: ListQueryWithOrderDto
  ): Promise<ImpasseInterfaces.ResponseWithoutPagination> {
    return this.impasseService.findAll(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<ImpasseInterfaces.Response> {
    return this.impasseService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: ImpasseUpdateDto
  ): Promise<ImpasseInterfaces.Response> {
    return this.impasseService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<ImpasseInterfaces.Response> {
    return this.impasseService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<ImpasseInterfaces.Response> {
    return this.impasseService.restore(data);
  }
}
