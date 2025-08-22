import { Controller, Post, Get, Put, Delete, Patch } from '@nestjs/common';
import { TempCacheService } from './temp-cache.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CacheServiceCommands as Commands,
  CacheCreateDto,
  CacheUpdateDto,
  CacheInterfaces,
} from 'types/organization/cache';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import { CityRegionFilterDto } from 'types/global/dto/city-region-filter.dto';

@Controller('passage')
export class TempCacheController {
  constructor(private readonly passageService: TempCacheService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(@Payload() data: CacheCreateDto): Promise<CacheInterfaces.Response> {

    return this.passageService.create(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<CacheInterfaces.Response> {
    return this.passageService.findOne(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<CacheInterfaces.Response> {
    return this.passageService.remove(data);
  }
}
