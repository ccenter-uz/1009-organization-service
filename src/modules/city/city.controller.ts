import { Controller, Post, Get, Put, Delete, Patch } from '@nestjs/common';
import { CityService } from './city.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CityServiceCommands as Commands } from 'types/organization/city/commands';
import {
  CityCreateDto,
  CityUpdateDto,
  CityInterfaces,
} from 'types/organization/city';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(@Payload() data: CityCreateDto): Promise<CityInterfaces.Response> {
    return this.cityService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: LanguageRequestDto
  ): Promise<CityInterfaces.ResponseWithoutPagination> {
    return this.cityService.findAll(data);
  }

  @Get()
  @MessagePattern({ cmd: Commands.GET_LIST_BY_PAGINATION })
  findAllByPagination(
    @Payload() data: ListQueryDto
  ): Promise<CityInterfaces.ResponseWithPagination> {
    return this.cityService.findAllByPagination(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<CityInterfaces.Response> {
    return this.cityService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(@Payload() data: CityUpdateDto): Promise<CityInterfaces.Response> {
    return this.cityService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<CityInterfaces.Response> {
    return this.cityService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<CityInterfaces.Response> {
    return this.cityService.restore(data);
  }
}
