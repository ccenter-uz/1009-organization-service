import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SectionService } from './section.service';
import { SectionServiceCommands as Commands } from 'types/organization/section/commands';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import {
  SectionCreateDto,
  SectionInterfaces,
  SectionUpdateDto,
} from 'types/organization/section';

@Controller('section')
export class SectionController {
  constructor(private readonly categoryService: SectionService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: SectionCreateDto
  ): Promise<SectionInterfaces.Response> {
    return this.categoryService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: ListQueryDto
  ): Promise<SectionInterfaces.ResponseWithoutPagination> {
    return this.categoryService.findAll(data);
  }


  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<SectionInterfaces.Response> {
    return this.categoryService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: SectionUpdateDto
  ): Promise<SectionInterfaces.Response> {
    return this.categoryService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<SectionInterfaces.Response> {
    return this.categoryService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<SectionInterfaces.Response> {
    return this.categoryService.restore(data);
  }
}
