import { Controller, Post, Get, Put, Delete, Patch } from '@nestjs/common';
import { DistrictService } from './district.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  DistrictCreateDto,
  DistrictUpdateDto,
  DistrictInterfaces,
  DistrictServiceCommands as Commands,
} from 'types/organization/district';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import { DistrictFilterDto } from 'types/organization/district/dto/filter-district.dto';

@Controller('district')
export class DistrictController {
  constructor(private readonly subCategoryService: DistrictService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: DistrictCreateDto
  ): Promise<DistrictInterfaces.Response> {
    return this.subCategoryService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: DistrictFilterDto
  ): Promise<DistrictInterfaces.ResponseWithoutPagination> {
    return this.subCategoryService.findAll(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<DistrictInterfaces.Response> {
    return this.subCategoryService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: DistrictUpdateDto
  ): Promise<DistrictInterfaces.Response> {
    return this.subCategoryService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<DistrictInterfaces.Response> {
    return this.subCategoryService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<DistrictInterfaces.Response> {
    return this.subCategoryService.restore(data);
  }
}
