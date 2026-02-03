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
  GetSiteStatisticsDto,
  siteStatisticsCreateDto,
  siteStatisticsInterfaces,
} from 'types/organization/site-statistics';
import { ListQueryWithOrderDto } from 'types/global/dto/list-query-with-order.dto';
import { IsNumber } from 'class-validator';
import { buildDateFilter } from '@/common/helper/format-date.helper';

@Injectable()
export class siteStatisticsService {
  private logger = new Logger(siteStatisticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: siteStatisticsCreateDto
  ): Promise<siteStatisticsInterfaces.Response> {
    const methodName = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    // UNIQUE KEY
    const uniqueKey = `${data.ip}_${data.userAgent}_${data.organizationId}`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.siteStatistics.findFirst({
      where: {
        OrganizationId: data.organizationId,
        uniqueKey: 'uniqueKey',
        createdAt: {
          gte: today,
        },
      },
    });

    let siteStatistics;

    if (existing && existing.uniqueKey === uniqueKey) {
      siteStatistics = await this.prisma.siteStatistics.update({
        where: { id: existing.id },
        data: {
          updatedAt: new Date(),
        },
      });
    } else {
      siteStatistics = await this.prisma.siteStatistics.create({
        data: {
          uniqueKey,
          ip: data.ip,
          userAgent: data.userAgent,

          address: data.addressCity,
          userLogId: data.userLogId,
          device: data.device,
          sourceSite: data.sourceSite,
          sessionTime: data.sessionTime,
          OrganizationId: data.organizationId,
        },
      });
    }

    this.logger.debug(`Method: ${methodName} - Response: `, siteStatistics);

    return siteStatistics;
  }

  async findOne(
    data: GetSiteStatisticsDto
  ): Promise<siteStatisticsInterfaces.Response> {
    const methodName = this.findOne.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const statistics = await this.prisma.siteStatistics.findMany({
      where: {
        OrganizationId: data.id,
        createdAt: buildDateFilter(data.dateRange),
      },
    });

    if (!statistics.length) {
      throw new NotFoundException('statistics is not found');
    }

    const result = {
      total: statistics.length,
      totalPageviews: statistics.length,
      uniqueUsers: 0,
      avarageSessionTime: 0,
      byDevice: {} as Record<string, number>,
      byAddress: {} as Record<string, number>,
      bySourceSite: {} as Record<string, number>,
      byViewsGraph: {} as Record<string, number>,
    };

    // 🔥 uniqueKey orqali unique
    const uniqueVisitors = new Set<string>();

    for (const item of statistics) {
      // UNIQUE USERS
      if (item.uniqueKey) {
        uniqueVisitors.add(item.uniqueKey);
      }

      // DEVICE
      const device = item.device?.toLowerCase() || 'other';
      result.byDevice[device] = (result.byDevice[device] || 0) + 1;

      // ADDRESS
      const address = item.address?.toLowerCase() || 'other';
      result.byAddress[address] = (result.byAddress[address] || 0) + 1;

      // SOURCE
      const site = item.sourceSite?.toLowerCase() || 'other';
      result.bySourceSite[site] = (result.bySourceSite[site] || 0) + 1;

      // SESSION TIME
      if (item.sessionTime && +item.sessionTime >= 0) {
        result.avarageSessionTime += +item.sessionTime;
      }

      // GRAPH
      if (item.createdAt) {
        const date = new Date(item.createdAt);
        const formatted = date.toLocaleDateString('uz-UZ').replace(/\//g, '.');

        result.byViewsGraph[formatted] =
          (result.byViewsGraph[formatted] || 0) + 1;
      }
    }

    // FINAL UNIQUE COUNT
    result.uniqueUsers = uniqueVisitors.size;

    // AVERAGE TIME
    if (statistics.length) {
      result.avarageSessionTime = result.avarageSessionTime / statistics.length;
    }

    this.logger.debug(`Method: ${methodName} - Response: `, result);

    return result;
  }
}
