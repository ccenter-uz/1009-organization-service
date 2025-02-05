import { Injectable } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  MonitoringFilterDto,
  MonitoringInterfaces,
} from 'types/organization/monitoring';
import { Roles } from 'types/global';

@Injectable()
export class MonitoringService {
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
    console.log(data.onlyOrgs, 'ONLY ORGS');

    if (data.all) {
      const monitoringData = await this.prisma.apiLogs.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return {
        data: monitoringData,
        totalDocs: monitoringData.length,
        totalPage: 1,
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

    if (data.onlyOrgs) {
      where.organizationName = {
        not: null,
      };
    }

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

    return {
      data: monitoringData,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }
}
