import { Controller, Post, Get, Put, Delete, Patch } from '@nestjs/common';
import { StreetService } from './street.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  StreetCreateDto,
  StreetUpdateDto,
  StreetInterfaces,
  StreetServiceCommands as Commands,
} from 'types/organization/street';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';

@Controller('street')
export class StreetController {
  constructor(private readonly streetService: StreetService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: StreetCreateDto
  ): Promise<StreetInterfaces.Response> {
    return this.streetService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: LanguageRequestDto
  ): Promise<StreetInterfaces.ResponseWithoutPagination> {
    return this.streetService.findAll(data);
  }

  @Get()
  @MessagePattern({ cmd: Commands.GET_LIST_BY_PAGINATION })
  findAllByPagination(
    @Payload() data: ListQueryDto
  ): Promise<StreetInterfaces.ResponseWithPagination> {
    return this.streetService.findAllByPagination(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<StreetInterfaces.Response> {
    return this.streetService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: StreetUpdateDto
  ): Promise<StreetInterfaces.Response> {
    return this.streetService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<StreetInterfaces.Response> {
    return this.streetService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<StreetInterfaces.Response> {
    return this.streetService.restore(data);
  }
}
