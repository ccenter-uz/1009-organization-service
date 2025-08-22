import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeleteDto, GetOneDto } from 'types/global';

import {
  CacheCreateDto,
  CacheUpdateDto,
  CacheInterfaces,
} from 'types/organization/cache';

import { CacheService } from '../cache/cache.service';
@Injectable()
export class TempCacheService {
  private logger = new Logger(TempCacheService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService
  ) {}

  async create(data: CacheCreateDto): Promise<CacheInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const getCache = await this.cacheService.get(
      'temp-cache',
      data.id.toString()
    );

    if (data?.data?.pictures == null) {
      data.data.pictures = null;
    } else if (data.data.pictures.length == 0) {
      data.data.pictures = getCache?.data.pictures;
    }
    let updateData =
      getCache?.data != null
        ? {
            data: {
              ...getCache?.data,
              ...data.data,
            },
          }
        : {
            ...data,
          };

    const Updatecache = await this.cacheService.set(
      'temp-cache',
      data.id.toString(),
      updateData
    );

    this.logger.debug(`Method: ${methodName} - Response: `, updateData);

    return data;
  }

  async findOne(data: GetOneDto): Promise<CacheInterfaces.Response> {
    const methodName: string = this.findOne.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const cache = await this.cacheService.get('temp-cache', data.id.toString());

    this.logger.debug(`Method: ${methodName} - Response: `, cache);

    return cache;
  }

  async remove(data: DeleteDto): Promise<CacheInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    let cache = await this.cacheService.get('temp-cache', data.id.toString());

    await this.cacheService.delete('temp-cache', data.id.toString());

    this.logger.debug(`Method: ${methodName} - Response: `, cache);

    return cache;
  }
}
