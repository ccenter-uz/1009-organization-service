import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AdditionalService } from './additional.service';
import { AdditionalServiceCommands as Commands } from 'types/organization/additional/commands';
import {
  AdditionalCreateDto,
  AdditionalInterfaces,
  AdditionalUpdateDto,
} from 'types/organization/additional';
import { DeleteDto, GetOneDto } from 'types/global';
import { AdditionalFilterDto } from 'types/organization/additional/dto/filter-additional.dto';

@Controller('additional')
export class AdditionalController {
  constructor(
    private readonly additionalService: AdditionalService
  ) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: AdditionalCreateDto
  ): Promise<AdditionalInterfaces.Response> {
    return this.additionalService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: AdditionalFilterDto
  ): Promise<AdditionalInterfaces.ResponseWithoutPagination> {
    return this.additionalService.findAll(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(
    @Payload() data: GetOneDto
  ): Promise<AdditionalInterfaces.Response> {
    return this.additionalService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: AdditionalUpdateDto
  ): Promise<AdditionalInterfaces.Response> {
    return this.additionalService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(
    @Payload() data: DeleteDto
  ): Promise<AdditionalInterfaces.Response> {
    return this.additionalService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(
    @Payload() data: GetOneDto
  ): Promise<AdditionalInterfaces.Response> {
    return this.additionalService.restore(data);
  }
}
