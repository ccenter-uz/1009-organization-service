import { Controller, Post, Get, Put, Delete, Patch } from '@nestjs/common';
import { VillageService } from './village.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  VillageCreateDto,
  VillageUpdateDto,
  VillageInterfaces,
  VillageServiceCommands as Commands,
} from 'types/organization/village';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';

@Controller('village')
export class VillageController {
  constructor(private readonly villageService: VillageService) { }

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: VillageCreateDto
  ): Promise<VillageInterfaces.Response> {
    return this.villageService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: LanguageRequestDto
  ): Promise<VillageInterfaces.ResponseWithoutPagination> {
    return this.villageService.findAll(data);
  }

  @Get()
  @MessagePattern({ cmd: Commands.GET_LIST_BY_PAGINATION })
  findAllByPagination(
    @Payload() data: ListQueryDto
  ): Promise<VillageInterfaces.ResponseWithPagination> {
    return this.villageService.findAllByPagination(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<VillageInterfaces.Response> {
    return this.villageService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: VillageUpdateDto
  ): Promise<VillageInterfaces.Response> {
    return this.villageService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<VillageInterfaces.Response> {
    return this.villageService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<VillageInterfaces.Response> {
    return this.villageService.restore(data);
  }
}
