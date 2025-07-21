import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SavedOrganizationService } from './saved-organization.service';
import { SavedOrganizationCommands as Commands } from 'types/organization/saved-organization/commands';
import {
  GetOneSavedOrganizationDto,
  SavedOrganizationCreateDto,
  SavedOrganizationFilterDto,
  savedOrganizationInterfaces,
  savedOrganizationUpdateDto,
} from 'types/organization/saved-organization';
import { DeleteDto, GetOneDto } from 'types/global';
import { CityRegionFilterDto } from 'types/global/dto/city-region-filter.dto';
import { CategoryDeleteDto } from 'types/organization/category/dto/delete-category.dto';

@Controller('saved-organization')
export class SavedOrganizationController {
  constructor(private readonly categoryService: SavedOrganizationService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: SavedOrganizationCreateDto
  ): Promise<savedOrganizationInterfaces.Response> {
    return this.categoryService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: SavedOrganizationFilterDto
  ): Promise<savedOrganizationInterfaces.ResponseWithoutPagination> {
    return this.categoryService.findAll(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(
    @Payload() data: GetOneSavedOrganizationDto
  ): Promise<savedOrganizationInterfaces.Response> {
    return this.categoryService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: savedOrganizationUpdateDto
  ): Promise<savedOrganizationInterfaces.Response> {
    return this.categoryService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(
    @Payload() data: CategoryDeleteDto
  ): Promise<savedOrganizationInterfaces.Response> {
    return this.categoryService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(
    @Payload() data: GetOneDto
  ): Promise<savedOrganizationInterfaces.Response> {
    return this.categoryService.restore(data);
  }
}
