import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NearbyCategoryService } from './nearby-category.service';
import { NearbyCategoryServiceCommands as Commands } from 'types/organization/nearby-category/commands';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import {
  NearbyCategoryUpdateDto,
  NearbyCategoryCreateDto,
  NearbyCategoryInterfaces,
} from 'types/organization/nearby-category';

@Controller('nearby-category')
export class NearbyCategoryController {
  constructor(private readonly nearbyCategoryService: NearbyCategoryService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: NearbyCategoryCreateDto
  ): Promise<NearbyCategoryInterfaces.Response> {
    return this.nearbyCategoryService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: LanguageRequestDto
  ): Promise<NearbyCategoryInterfaces.ResponseWithoutPagination> {
    return this.nearbyCategoryService.findAll(data);
  }

  @Get()
  @MessagePattern({ cmd: Commands.GET_LIST_BY_PAGINATION })
  findAllByPagination(
    @Payload() data: ListQueryDto
  ): Promise<NearbyCategoryInterfaces.ResponseWithPagination> {
    return this.nearbyCategoryService.findAllByPagination(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(
    @Payload() data: GetOneDto
  ): Promise<NearbyCategoryInterfaces.Response> {
    return this.nearbyCategoryService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: NearbyCategoryUpdateDto
  ): Promise<NearbyCategoryInterfaces.Response> {
    return this.nearbyCategoryService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(
    @Payload() data: DeleteDto
  ): Promise<NearbyCategoryInterfaces.Response> {
    return this.nearbyCategoryService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(
    @Payload() data: GetOneDto
  ): Promise<NearbyCategoryInterfaces.Response> {
    return this.nearbyCategoryService.restore(data);
  }
}
