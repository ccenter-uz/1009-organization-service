import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AdditionalCategoryService } from './additional-category.service';
import { AdditionalCategoryServiceCommands as Commands } from 'types/organization/additional-category/commands';
import {
  AdditionalCategoryCreateDto,
  AdditionalCategoryInterfaces,
  AdditionalCategoryUpdateDto,
} from 'types/organization/additional-category';
import {
  DeleteDto,
  GetOneDto,
} from 'types/global';
import { AdditionalCategoryFilterDto } from 'types/organization/additional-category/dto/filter-additional-category.dto';

@Controller('additional-category')
export class AdditionalCategoryController {
  constructor(private readonly additionalCategoryService: AdditionalCategoryService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: AdditionalCategoryCreateDto
  ): Promise<AdditionalCategoryInterfaces.Response> {
    return this.additionalCategoryService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: AdditionalCategoryFilterDto
  ): Promise<AdditionalCategoryInterfaces.ResponseWithoutPagination> {
    return this.additionalCategoryService.findAll(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<AdditionalCategoryInterfaces.Response> {
    return this.additionalCategoryService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: AdditionalCategoryUpdateDto
  ): Promise<AdditionalCategoryInterfaces.Response> {
    return this.additionalCategoryService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<AdditionalCategoryInterfaces.Response> {
    return this.additionalCategoryService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<AdditionalCategoryInterfaces.Response> {
    return this.additionalCategoryService.restore(data);
  }
}
