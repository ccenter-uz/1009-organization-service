import {
  Controller,
  Post,
  Get,
  UploadedFiles,
  Put,
  Delete,
  Patch,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  OrganizationCreateDto,
  OrganizationInterfaces,
  OrganizationServiceCommands as Commands,
} from 'types/organization/organization';
import { DeleteDto, GetOneDto, ListQueryDto } from 'types/global';
import * as Multer from 'multer';
import { OrganizationFilterDto } from 'types/organization/organization/dto/filter-organization.dto';

import { MyOrganizationFilterDto } from 'types/organization/organization/dto/filter-my-organization.dto';

import { OrganizationDeleteDto } from 'types/organization/organization/dto/delete-organization.dto';
import { OrganizationRestoreDto } from 'types/organization/organization/dto/get-restore-organization.dto';
import { OrganizationVersionInterfaces } from 'types/organization/organization-version';
import { UnconfirmOrganizationFilterDto } from 'types/organization/organization/dto/filter-unconfirm-organization.dto';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  // @UseInterceptors(FilesInterceptor('photos'))
  create(
    @Payload() data: OrganizationCreateDto,
    @UploadedFiles() files: Array<Multer.File>
  ): Promise<OrganizationInterfaces.Response> {
    return this.organizationService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: OrganizationFilterDto
  ): Promise<OrganizationInterfaces.ResponseWithPagination> {
    return this.organizationService.findAll(data);
  }

  @Get('all-my')
  @MessagePattern({ cmd: Commands.GET_MY_LIST })
  findMy(
    @Payload() data: MyOrganizationFilterDto
  ): Promise<OrganizationVersionInterfaces.ResponseWithPagination> {
    return this.organizationService.findMy(data);
  }

  @Get('unconfirm')
  @MessagePattern({ cmd: Commands.GET_UNCONFIRM_LIST })
  findUnconfirm(
    @Payload() data: UnconfirmOrganizationFilterDto
  ): Promise<OrganizationVersionInterfaces.ResponseWithPagination> {
    return this.organizationService.findUnconfirm(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(
    @Payload() data: GetOneDto
  ): Promise<OrganizationInterfaces.Response> {
    return this.organizationService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.CONFIRM })
  update(
    @Payload() data: OrganizationInterfaces.Update
  ): Promise<OrganizationInterfaces.Response> {
    return this.organizationService.confirmOrg(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(
    @Payload() data: OrganizationDeleteDto
  ): Promise<OrganizationInterfaces.Response> {
    return this.organizationService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(
    @Payload() data: OrganizationRestoreDto
  ): Promise<OrganizationInterfaces.Response> {
    return this.organizationService.restore(data);
  }
}
