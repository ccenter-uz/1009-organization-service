import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AdditionalTableService } from './additional-table.service';
import { AdditionalTableServiceCommands as Commands } from 'types/organization/additional-table/commands';
import {
  AdditionalTableCreateDto,
  AdditionalTableInterfaces,
  AdditionalTableUpdateDto,
} from 'types/organization/additional-table';
import { DeleteDto, GetOneDto } from 'types/global';
import { AdditionalTableFilterDto } from 'types/organization/additional-table/dto/filter-additional-table.dto';

@Controller('additional-table')
export class AdditionalTableController {
  constructor(
    private readonly additionalTableService: AdditionalTableService
  ) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: AdditionalTableCreateDto
  ): Promise<AdditionalTableInterfaces.Response> {
    return this.additionalTableService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: AdditionalTableFilterDto
  ): Promise<AdditionalTableInterfaces.ResponseWithoutPagination> {
    return this.additionalTableService.findAll(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(
    @Payload() data: GetOneDto
  ): Promise<AdditionalTableInterfaces.Response> {
    return this.additionalTableService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: AdditionalTableUpdateDto
  ): Promise<AdditionalTableInterfaces.Response> {
    return this.additionalTableService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(
    @Payload() data: DeleteDto
  ): Promise<AdditionalTableInterfaces.Response> {
    return this.additionalTableService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(
    @Payload() data: GetOneDto
  ): Promise<AdditionalTableInterfaces.Response> {
    return this.additionalTableService.restore(data);
  }
}
