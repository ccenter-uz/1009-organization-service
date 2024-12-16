import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  OrganizationCreateDto,
  OrganizationUpdateDto,
  OrganizationInterfaces,
  OrganizationServiceCommands as Commands,
} from 'types/organization/organization';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as Multer from 'multer';
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
    console.log(data.photos, files, 'FILES');
    
    return this.organizationService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: LanguageRequestDto
  ): Promise<OrganizationInterfaces.ResponseWithoutPagination> {
    return this.organizationService.findAll(data);
  }

  @Get()
  @MessagePattern({ cmd: Commands.GET_LIST_BY_PAGINATION })
  findAllByPagination(
    @Payload() data: ListQueryDto
  ): Promise<OrganizationInterfaces.ResponseWithPagination> {
    return this.organizationService.findAllByPagination(data);
  }

  // @Get('by-id')
  // @MessagePattern({ cmd: Commands.GET_BY_ID })
  // findOne(@Payload() data: GetOneDto): Promise<OrganizationInterfaces.Response> {
  //   return this.organizationService.findOne(data);
  // }

  // @Put()
  // @MessagePattern({ cmd: Commands.UPDATE })
  // update(@Payload() data: OrganizationUpdateDto): Promise<OrganizationInterfaces.Response> {
  //   return this.organizationService.update(data);
  // }

  // @Delete()
  // @MessagePattern({ cmd: Commands.DELETE })
  // remove(@Payload() data: DeleteDto): Promise<OrganizationInterfaces.Response> {
  //   return this.organizationService.remove(data);
  // }

  // @Patch()
  // @MessagePattern({ cmd: Commands.RESTORE })
  // restore(@Payload() data: GetOneDto): Promise<OrganizationInterfaces.Response> {
  //   return this.organizationService.restore(data);
  // }
}
