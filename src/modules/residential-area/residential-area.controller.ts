import { Controller, Post, Get, Put, Delete, Patch } from '@nestjs/common';
import { ResidentialAreaService } from './residential-area.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ResidentialAreaCreateDto,
  ResidentialAreaUpdateDto,
  ResidentialAreaInterfaces,
  ResidentialAreaCommands as Commands,
} from 'types/organization/residential-area';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import { CityRegionFilterDto } from 'types/global/dto/city-region-filter.dto';

@Controller('residential-area')
export class ResidentialAreaController {
  constructor(
    private readonly residentialAreaService: ResidentialAreaService
  ) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: ResidentialAreaCreateDto
  ): Promise<ResidentialAreaInterfaces.Response> {
    return this.residentialAreaService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: CityRegionFilterDto
  ): Promise<ResidentialAreaInterfaces.ResponseWithoutPagination> {
    return this.residentialAreaService.findAll(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(
    @Payload() data: GetOneDto
  ): Promise<ResidentialAreaInterfaces.Response> {
    return this.residentialAreaService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: ResidentialAreaUpdateDto
  ): Promise<ResidentialAreaInterfaces.Response> {
    return this.residentialAreaService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(
    @Payload() data: DeleteDto
  ): Promise<ResidentialAreaInterfaces.Response> {
    return this.residentialAreaService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(
    @Payload() data: GetOneDto
  ): Promise<ResidentialAreaInterfaces.Response> {
    return this.residentialAreaService.restore(data);
  }
}
