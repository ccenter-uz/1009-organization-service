import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  DefaultStatus,
  DeleteDto,
  DeviceType,
  GetOneDto,
  ListQueryDto,
} from 'types/global';
import {
  siteStatisticsCreateDto,
  siteStatisticsInterfaces,
} from 'types/organization/site-statistics';
import { ListQueryWithOrderDto } from 'types/global/dto/list-query-with-order.dto';
import { IsNumber } from 'class-validator';

@Injectable()
export class siteStatisticsService {
  private logger = new Logger(siteStatisticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: siteStatisticsCreateDto
  ): Promise<siteStatisticsInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const siteStatistics = await this.prisma.siteStatistics.create({
      data: {
        address: data.addressCity,
        userLogId: data.userLogId,
        device: data.device,
        sourceSite: data.sourceSite,
        sessionTime: data.sessionTime,
        OrganizationId: data.organizationId,
      },
      select: {
        id: true,
        address: true,
        device: true,
        sourceSite: true,
        createdAt: true,
        deletedAt: true,
        updatedAt: true,
      },
    });
    this.logger.debug(`Method: ${methodName} - Response: `, siteStatistics);

    return siteStatistics;
  }

  async findOne(data: GetOneDto): Promise<siteStatisticsInterfaces.Response> {
    const methodName: string = this.findOne.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const statistics = await this.prisma.siteStatistics.findMany({
      where: {
        OrganizationId: data.id,
      },
    });


    const result = {
      total: statistics.length,
      totalPageviews: statistics.length,
      uniqueUsers: 0,
      avarageSessionTime: 0,
      byDevice: {} as Record<string, number>,
      byAddress: {} as Record<string, number>,
      bySourceSite: {} as Record<string, number>,
    };
    const uniqueUserIds = new Set<number>();
    for (const item of statistics) {


      const device = item.device?.toLowerCase() || 'other';
      const address = item.address?.toLowerCase() || 'other';
      const site = item.sourceSite?.toLowerCase() || 'other';

      result.byDevice[device] = (result.byDevice[device] || 0) + 1;

      result.byAddress[address] = (result.byAddress[address] || 0) + 1;

      result.bySourceSite[site] = (result.bySourceSite[site] || 0) + 1;
      if (item.userLogId) {
        uniqueUserIds.add(item.userLogId);
      }
      if (item.sessionTime && +item.sessionTime >= 0) {
        result.avarageSessionTime += +item.sessionTime;
      }
    }

    if (!statistics) {
      throw new NotFoundException('statistics is not found');
    }
    this.logger.debug(`Method: ${methodName} - Response: `, statistics);
    result.uniqueUsers = uniqueUserIds.size;


    return result;
  }
}
