import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AdditionalContentService } from './additional-content.service';
import { AdditionalContentServiceCommands as Commands } from 'types/organization/additional-content/commands';
import {
  AdditionalContentCreateDto,
  AdditionalContentInterfaces,
  AdditionalContentUpdateDto,
} from 'types/organization/additional-content';
import { DeleteDto, GetOneDto } from 'types/global';
import { AdditionalContentFilterDto } from 'types/organization/additional-content/dto/filter-additional-content.dto';

@Controller('additional-content')
export class AdditionalContentController {
  constructor(
    private readonly additionalContentService: AdditionalContentService
  ) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: AdditionalContentCreateDto
  ): Promise<AdditionalContentInterfaces.Response> {
    return this.additionalContentService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: AdditionalContentFilterDto
  ): Promise<AdditionalContentInterfaces.ResponseWithoutPagination> {
    return this.additionalContentService.findAll(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(
    @Payload() data: GetOneDto
  ): Promise<AdditionalContentInterfaces.Response> {
    return this.additionalContentService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: AdditionalContentUpdateDto
  ): Promise<AdditionalContentInterfaces.Response> {
    return this.additionalContentService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(
    @Payload() data: DeleteDto
  ): Promise<AdditionalContentInterfaces.Response> {
    return this.additionalContentService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(
    @Payload() data: GetOneDto
  ): Promise<AdditionalContentInterfaces.Response> {
    return this.additionalContentService.restore(data);
  }
}
