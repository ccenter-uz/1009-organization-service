import {
  Controller,
  Post,
  Get,
  Put,
  UploadedFiles,
} from '@nestjs/common';
import { OrganizationVersionService } from './organization-version.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  OrganizationVersionInterfaces,
  OrganizationVersionServiceCommands as Commands,
  OrganizationVersionUpdateDto,
} from 'types/organization/organization-version';
import {
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import * as Multer from 'multer';
@Controller('organization')
export class OrganizationVersionController {
  constructor(
    private readonly organizationService: OrganizationVersionService
  ) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  // @UseInterceptors(FilesInterceptor('photos'))
  create(
    @Payload() data: OrganizationVersionInterfaces.Request,
    @UploadedFiles() files: Array<Multer.File>
  ): Promise<OrganizationVersionInterfaces.Response> {
    return this.organizationService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: LanguageRequestDto
  ): Promise<OrganizationVersionInterfaces.ResponseWithoutPagination> {
    return this.organizationService.findAll(data);
  }

  @Get()
  @MessagePattern({ cmd: Commands.GET_LIST_BY_PAGINATION })
  findAllByPagination(
    @Payload() data: ListQueryDto
  ): Promise<OrganizationVersionInterfaces.ResponseWithPagination> {
    return this.organizationService.findAllByPagination(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(
    @Payload() data: GetOneDto
  ): Promise<OrganizationVersionInterfaces.Response> {
    return this.organizationService.findOne(data);
  }


  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: OrganizationVersionUpdateDto
  ): Promise<OrganizationVersionInterfaces.Update> {

    return this.organizationService.update(data);
  }

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
