import { Controller, Post, Get, Put, Delete, Patch } from '@nestjs/common';
import { AreaService } from './area.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  AreaCreateDto,
  AreaUpdateDto,
  AreaInterfaces,
  AreaServiceCommands as Commands,
} from 'types/organization/area';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';

@Controller('area')
export class AreaController {
  constructor(private readonly areaService: AreaService) { }

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: AreaCreateDto
  ): Promise<AreaInterfaces.Response> {
    return this.areaService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: LanguageRequestDto
  ): Promise<AreaInterfaces.ResponseWithoutPagination> {
    return this.areaService.findAll(data);
  }

  @Get()
  @MessagePattern({ cmd: Commands.GET_LIST_BY_PAGINATION })
  findAllByPagination(
    @Payload() data: ListQueryDto
  ): Promise<AreaInterfaces.ResponseWithPagination> {
    return this.areaService.findAllByPagination(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<AreaInterfaces.Response> {
    return this.areaService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: AreaUpdateDto
  ): Promise<AreaInterfaces.Response> {
    return this.areaService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<AreaInterfaces.Response> {
    return this.areaService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<AreaInterfaces.Response> {
    return this.areaService.restore(data);
  }
}
