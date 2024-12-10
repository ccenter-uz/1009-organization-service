import { Controller, Post, Get, Put, Delete, Patch } from '@nestjs/common';
import { ProductServiceSubCategoryService } from './product-service-sub-category.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductServiceSubCategoryServiceCommands as Commands } from 'types/organization/product-service-sub-category/commands';
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
import { ProductServiceSubCategoryFilterDto } from 'types/organization/product-service-sub-category/dto/filter-product-service-sub-category.dto';

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
    @Payload() data: ProductServiceSubCategoryFilterDto
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
