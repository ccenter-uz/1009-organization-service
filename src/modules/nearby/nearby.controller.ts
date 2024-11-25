import { Controller, Post, Get, Put, Delete, Patch } from '@nestjs/common';
import { NearbyService } from './nearby.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  NearbyServiceCommands as Commands,
  NearbyCreateDto,
  NearbyUpdateDto,
  NearbyInterfaces
} from 'types/organization/nearby';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';

@Controller('nearby')
export class NearbyController {
  constructor(private readonly subCategoryService: NearbyService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: NearbyCreateDto
  ): Promise<NearbyInterfaces.Response> {
    return this.subCategoryService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: LanguageRequestDto
  ): Promise<NearbyInterfaces.ResponseWithoutPagination> {
    return this.subCategoryService.findAll(data);
  }

  @Get()
  @MessagePattern({ cmd: Commands.GET_LIST_BY_PAGINATION })
  findAllByPagination(
    @Payload() data: ListQueryDto
  ): Promise<NearbyInterfaces.ResponseWithPagination> {
    return this.subCategoryService.findAllByPagination(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<NearbyInterfaces.Response> {
    return this.subCategoryService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: NearbyUpdateDto
  ): Promise<NearbyInterfaces.Response> {
    return this.subCategoryService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<NearbyInterfaces.Response> {
    return this.subCategoryService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<NearbyInterfaces.Response> {
    return this.subCategoryService.restore(data);
  }
}
