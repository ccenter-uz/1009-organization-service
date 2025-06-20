import { Injectable, Logger } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  MonitoringFilterDto,
  MonitoringInterfaces,
} from 'types/organization/monitoring';
import { Roles } from 'types/global';

@Injectable()
export class MonitoringService {
  private logger = new Logger(MonitoringService.name);
  constructor(private readonly prisma: PrismaService) {}

  // async create(
  //   data: MainOrganizationCreateDto
  // ): Promise<MainOrganizationInterfaces.Response> {
  //   // const mainOrganization = await this.prisma.mainOrganization
  //   const mainOrganization = await this.prisma.mainOrganization.create({
  //     data: {
  //       staffNumber: data.staffNumber,
  //       name: data.name,
  //     },
  //   });

  //   return mainOrganization;
  // }

  async findAll(
    data: MonitoringFilterDto
  ): Promise<MonitoringInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);

    if (data.all) {
      const monitoringData = await this.prisma.apiLogs.findMany({
        orderBy: { createdAt: 'desc' },
      });
      this.logger.debug(`Method: ${methodName} - Response: `, monitoringData);

      return {
        data: monitoringData,
        totalDocs: monitoringData.length,
        totalPage: monitoringData.length > 0 ? 1 : 0,
      };
    }

    const where: any = {};

    if (data.role == Roles.OPERATOR) {
      // where.userNumericId = data.staffNumber;

      where.role = {
        in: [Roles.USER, Roles.OPERATOR],
      };
    }

    if (data.search) {
      where.organizationName = {
        contains: data.search,
        mode: 'insensitive',
      };
    }

    if (data.userId) {
      where.userId = data.userId;
    }

    if (data.organizationId) {
      where.organizationId = data.organizationId;
    }

    // if (data.referenceId) {
    //   where.referenceId = data.referenceId;
    // }

    if (data.onlyOrgs) {
      where.organizationName = {
        not: null,
      };
    }
    // if (data.method && data.method != 'ALL') {
    //   where.method = data.method;
    // }
    // if (data.module) {
    //   where.module = data.module;
    // }

    const count = await this.prisma.apiLogs.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const monitoringData = await this.prisma.apiLogs.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
    });
    this.logger.debug(`Method: ${methodName} - Response: `, monitoringData);

    return {
      data: monitoringData,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }
}
