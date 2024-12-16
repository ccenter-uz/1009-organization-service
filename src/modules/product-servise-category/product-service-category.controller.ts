import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductServiceCategoryService } from './product-service-category.service';
import { ProductServiceCategoryServiceCommands as Commands } from 'types/organization/product-service-category/commands';
import {
  CategoryCreateDto,
  CategoryInterfaces,
  CategoryUpdateDto,
} from 'types/organization/category';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import {
  ProductServiseCategoryCreateDto,
  ProductServiseCategoryInterfaces,
  ProductServiseCategoryUpdateDto,
} from 'types/organization/product-service-category';

@Controller('product-service-category')
export class ProductServiceCategoryController {
  constructor(
    private readonly categoryService: ProductServiceCategoryService
  ) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: ProductServiseCategoryCreateDto
  ): Promise<ProductServiseCategoryInterfaces.Response> {
    return this.categoryService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: ListQueryDto
  ): Promise<ProductServiseCategoryInterfaces.ResponseWithoutPagination> {
    return this.categoryService.findAll(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(
    @Payload() data: GetOneDto
  ): Promise<ProductServiseCategoryInterfaces.Response> {
    return this.categoryService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: ProductServiseCategoryUpdateDto
  ): Promise<ProductServiseCategoryInterfaces.Response> {
    return this.categoryService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(
    @Payload() data: DeleteDto
  ): Promise<ProductServiseCategoryInterfaces.Response> {
    return this.categoryService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(
    @Payload() data: GetOneDto
  ): Promise<ProductServiseCategoryInterfaces.Response> {
    return this.categoryService.restore(data);
  }
}
