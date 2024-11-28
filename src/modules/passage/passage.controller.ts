import { Controller, Post, Get, Put, Delete, Patch } from '@nestjs/common';
import { PassageService } from './passage.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  PassageCreateDto,
  PassageUpdateDto,
  PassageInterfaces,
  PassageServiceCommands as Commands,
} from 'types/organization/passage';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';

@Controller('passage')
export class PassageController {
  constructor(private readonly passageService: PassageService) { }

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: PassageCreateDto
  ): Promise<PassageInterfaces.Response> {
    return this.passageService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: LanguageRequestDto
  ): Promise<PassageInterfaces.ResponseWithoutPagination> {
    return this.passageService.findAll(data);
  }

  @Get()
  @MessagePattern({ cmd: Commands.GET_LIST_BY_PAGINATION })
  findAllByPagination(
    @Payload() data: ListQueryDto
  ): Promise<PassageInterfaces.ResponseWithPagination> {
    return this.passageService.findAllByPagination(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<PassageInterfaces.Response> {
    return this.passageService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: PassageUpdateDto
  ): Promise<PassageInterfaces.Response> {
    return this.passageService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<PassageInterfaces.Response> {
    return this.passageService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<PassageInterfaces.Response> {
    return this.passageService.restore(data);
  }
}
