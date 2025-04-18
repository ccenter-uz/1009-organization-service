import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MainOrganizationService } from './main-organization.service';
import { MainOrganizationServiceCommands as Commands } from 'types/organization/main-organization/commands';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import {
  MainOrganizationCreateDto,
  MainOrganizationInterfaces,
  MainOrganizationUpdateDto,
} from 'types/organization/main-organization';
import { ListQueryWithOrderDto } from 'types/global/dto/list-query-with-order.dto';

@Controller('main-organization')
export class MainOrganizationController {
  constructor(private readonly categoryService: MainOrganizationService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: MainOrganizationCreateDto
  ): Promise<MainOrganizationInterfaces.Response> {
 
    return this.categoryService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: ListQueryWithOrderDto
  ): Promise<MainOrganizationInterfaces.ResponseWithoutPagination> {
    return this.categoryService.findAll(data);
  }


  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(
    @Payload() data: GetOneDto
  ): Promise<MainOrganizationInterfaces.Response> {
    return this.categoryService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: MainOrganizationUpdateDto
  ): Promise<MainOrganizationInterfaces.Response> {
    return this.categoryService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(
    @Payload() data: DeleteDto
  ): Promise<MainOrganizationInterfaces.Response> {
    return this.categoryService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(
    @Payload() data: GetOneDto
  ): Promise<MainOrganizationInterfaces.Response> {
    return this.categoryService.restore(data);
  }
}
