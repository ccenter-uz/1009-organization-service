import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SegmentService } from './segment.service';
import { SegmentServiceCommands as Commands } from 'types/organization/segment/commands';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import {
  SegmentCreateDto,
  SegmentInterfaces,
  SegmentUpdateDto,
} from 'types/organization/segment';
import { ListQueryWithOrderDto } from 'types/global/dto/list-query-with-order.dto';

@Controller('segment')
export class SegmentController {
  constructor(private readonly categoryService: SegmentService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: SegmentCreateDto
  ): Promise<SegmentInterfaces.Response> {
    return this.categoryService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: ListQueryWithOrderDto
  ): Promise<SegmentInterfaces.ResponseWithoutPagination> {
    return this.categoryService.findAll(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<SegmentInterfaces.Response> {
    return this.categoryService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: SegmentUpdateDto
  ): Promise<SegmentInterfaces.Response> {
    return this.categoryService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<SegmentInterfaces.Response> {
    return this.categoryService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<SegmentInterfaces.Response> {
    return this.categoryService.restore(data);
  }
}
