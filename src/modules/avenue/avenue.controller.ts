import { Controller, Post, Get, Put, Delete, Patch } from '@nestjs/common';
import { AvenueService } from './avenue.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  AvenueCreateDto,
  AvenueUpdateDto,
  AvenueInterfaces,
  AvenueServiceCommands as Commands,
} from 'types/organization/avenue';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';

@Controller('avenue')
export class AvenueController {
  constructor(private readonly avenueService: AvenueService) { }

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: AvenueCreateDto
  ): Promise<AvenueInterfaces.Response> {
    return this.avenueService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: LanguageRequestDto
  ): Promise<AvenueInterfaces.ResponseWithoutPagination> {
    return this.avenueService.findAll(data);
  }

  @Get()
  @MessagePattern({ cmd: Commands.GET_LIST_BY_PAGINATION })
  findAllByPagination(
    @Payload() data: ListQueryDto
  ): Promise<AvenueInterfaces.ResponseWithPagination> {
    return this.avenueService.findAllByPagination(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<AvenueInterfaces.Response> {
    return this.avenueService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: AvenueUpdateDto
  ): Promise<AvenueInterfaces.Response> {
    return this.avenueService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<AvenueInterfaces.Response> {
    return this.avenueService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<AvenueInterfaces.Response> {
    return this.avenueService.restore(data);
  }
}
