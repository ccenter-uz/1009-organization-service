import { Controller, Post, Get, Put, Delete, Patch } from '@nestjs/common';
import { ProductServiceSubCategoryService } from './sub-category.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SubCategoryInterfaces } from 'types/organization/sub-category/interface/sub-category-group.interface';
import { ProductServiceSubCategoryServiceCommands as Commands } from 'types/organization/product-service-sub-category/commands';
import {
  SubCategoryCreateDto,
  SubCategoryUpdateDto,
} from 'types/organization/sub-category';
import { CategoryInterfaces } from 'types/organization/category';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import {
  ProductServiceSubCategoryCreateDto,
  ProductServiceSubCategoryInterfaces,
  ProductServiceSubCategoryUpdateDto,
} from 'types/organization/product-service-sub-category';

@Controller('product-service-sub-category')
export class ProductServiceSubCategoryController {
  constructor(
    private readonly subCategoryService: ProductServiceSubCategoryService
  ) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: ProductServiceSubCategoryCreateDto
  ): Promise<ProductServiceSubCategoryInterfaces.Response> {
    return this.subCategoryService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: LanguageRequestDto
  ): Promise<ProductServiceSubCategoryInterfaces.ResponseWithoutPagination> {
    return this.subCategoryService.findAll(data);
  }

  @Get()
  @MessagePattern({ cmd: Commands.GET_LIST_BY_PAGINATION })
  findAllByPagination(
    @Payload() data: ListQueryDto
  ): Promise<ProductServiceSubCategoryInterfaces.ResponseWithPagination> {
    return this.subCategoryService.findAllByPagination(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(
    @Payload() data: GetOneDto
  ): Promise<ProductServiceSubCategoryInterfaces.Response> {
    return this.subCategoryService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: ProductServiceSubCategoryUpdateDto
  ): Promise<ProductServiceSubCategoryInterfaces.Response> {
    return this.subCategoryService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(
    @Payload() data: DeleteDto
  ): Promise<ProductServiceSubCategoryInterfaces.Response> {
    return this.subCategoryService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(
    @Payload() data: GetOneDto
  ): Promise<ProductServiceSubCategoryInterfaces.Response> {
    return this.subCategoryService.restore(data);
  }
}
