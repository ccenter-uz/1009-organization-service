import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegionService } from './region.service';
import { RegionServiceCommands as Commands } from 'types/organization/region/commands';
import {
  RegionCreateDto,
  RegionInterfaces,
  RegionUpdateDto,
} from 'types/organization/region';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';

@Controller('region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(@Payload() data: RegionCreateDto): Promise<RegionInterfaces.Response> {
    return this.regionService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: LanguageRequestDto
  ): Promise<RegionInterfaces.ResponseWithoutPagination> {
    return this.regionService.findAll(data);
  }

  @Get()
  @MessagePattern({ cmd: Commands.GET_LIST_BY_PAGINATION })
  findAllByPagination(
    @Payload() data: ListQueryDto
  ): Promise<RegionInterfaces.ResponseWithPagination> {
    return this.regionService.findAllByPagination(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<RegionInterfaces.Response> {
    return this.regionService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(@Payload() data: RegionUpdateDto): Promise<RegionInterfaces.Response> {
    return this.regionService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<RegionInterfaces.Response> {
    return this.regionService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<RegionInterfaces.Response> {
    return this.regionService.restore(data);
  }
}
