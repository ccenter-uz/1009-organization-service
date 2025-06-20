import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoryService } from './category.service';
import { CategoryServiceCommands as Commands } from 'types/organization/category/commands';
import {
  CategoryCreateDto,
  CategoryInterfaces,
  CategoryUpdateDto,
} from 'types/organization/category';
import { DeleteDto, GetOneDto } from 'types/global';
import { CityRegionFilterDto } from 'types/global/dto/city-region-filter.dto';
import { CategoryDeleteDto } from 'types/organization/category/dto/delete-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: CategoryCreateDto
  ): Promise<CategoryInterfaces.Response> {
    return this.categoryService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: CityRegionFilterDto
  ): Promise<CategoryInterfaces.ResponseWithoutPagination> {
    return this.categoryService.findAll(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<CategoryInterfaces.Response> {
    return this.categoryService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: CategoryUpdateDto
  ): Promise<CategoryInterfaces.Response> {
    return this.categoryService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(
    @Payload() data: CategoryDeleteDto
  ): Promise<CategoryInterfaces.Response> {
    return this.categoryService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<CategoryInterfaces.Response> {
    return this.categoryService.restore(data);
  }
}
