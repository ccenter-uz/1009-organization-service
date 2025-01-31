import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PhoneTypeService } from './phone-type.service';
import { PhoneTypeServiceCommands as Commands } from 'types/organization/phone-type/commands';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import {
  PhoneTypeUpdateDto,
  PhoneTypeCreateDto,
  PhoneTypeInterfaces,
} from 'types/organization/phone-type';
import { ListQueryWithOrderDto } from 'types/global/dto/list-query-with-order.dto';

@Controller('phone-type')
export class PhoneTypeController {
  constructor(private readonly phoneTypeService: PhoneTypeService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: PhoneTypeCreateDto
  ): Promise<PhoneTypeInterfaces.Response> {
    return this.phoneTypeService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: ListQueryWithOrderDto
  ): Promise<PhoneTypeInterfaces.ResponseWithoutPagination> {
    return this.phoneTypeService.findAll(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(
    @Payload() data: GetOneDto
  ): Promise<PhoneTypeInterfaces.Response> {
    return this.phoneTypeService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: PhoneTypeUpdateDto
  ): Promise<PhoneTypeInterfaces.Response> {
    return this.phoneTypeService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(
    @Payload() data: DeleteDto
  ): Promise<PhoneTypeInterfaces.Response> {
    return this.phoneTypeService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(
    @Payload() data: GetOneDto
  ): Promise<PhoneTypeInterfaces.Response> {
    return this.phoneTypeService.restore(data);
  }
}
