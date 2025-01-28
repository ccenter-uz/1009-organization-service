import { Injectable, NotFoundException } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';

import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import {
  MainOrganizationCreateDto,
  MainOrganizationInterfaces,
  MainOrganizationUpdateDto,
} from 'types/organization/main-organization';
import { ListQueryWithOrderDto } from 'types/global/dto/list-query-with-order.dto';

@Injectable()
export class MainOrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: MainOrganizationCreateDto
  ): Promise<MainOrganizationInterfaces.Response> {
    // const mainOrganization = await this.prisma.mainOrganization
    const mainOrganization = await this.prisma.mainOrganization.create({
      data: {
        staffNumber: data.staffNumber,
        name: data.name,
        orderNumber: data.orderNumber,
      },
    });

    return mainOrganization;
  }

  async findAll(
    data: ListQueryWithOrderDto
  ): Promise<MainOrganizationInterfaces.ResponseWithPagination> {
    if (data.all) {
      const mainOrganization = await this.prisma.mainOrganization.findMany({
        where: {
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
        },
        orderBy:
          data.order === 'name'
            ? { name: 'asc' }
            : [
                {
                  orderNumber: 'asc',
                },
                { name: 'asc' },
              ],
      });

      return {
        data: mainOrganization,
        totalDocs: mainOrganization.length,
        totalPage: 1,
      };
    }

    const where: any = {
      ...(data.status == 2
        ? {}
        : {
            status: data.status,
          }),
    };

    if (data.search) {
      where.name = {
        contains: data.search,
        mode: 'insensitive',
      };
    }
    const count = await this.prisma.mainOrganization.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const mainOrganization = await this.prisma.mainOrganization.findMany({
      where,
      orderBy:
        data.order === 'name'
          ? { name: 'asc' }
          : [
              {
                orderNumber: 'asc',
              },
              { name: 'asc' },
            ],
      take: pagination.take,
      skip: pagination.skip,
    });

    return {
      data: mainOrganization,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<MainOrganizationInterfaces.Response> {
    const mainOrganization = await this.prisma.mainOrganization.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
    });

    if (!mainOrganization) {
      throw new NotFoundException('Main Organization is not found');
    }

    return mainOrganization;
  }

  async update(
    data: MainOrganizationUpdateDto
  ): Promise<MainOrganizationInterfaces.Response> {
    const mainOrganization = await this.findOne({ id: data.id });

    return await this.prisma.mainOrganization.update({
      where: {
        id: mainOrganization.id,
      },
      data: {
        staffNumber: data.staffNumber,
        name: data.name,
        orderNumber: data.orderNumber,
      },
    });
  }

  async remove(data: DeleteDto): Promise<MainOrganizationInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.mainOrganization.delete({
        where: { id: data.id },
      });
    }

    return await this.prisma.mainOrganization.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
    });
  }

  async restore(data: GetOneDto): Promise<MainOrganizationInterfaces.Response> {
    return this.prisma.mainOrganization.update({
      where: { id: data.id, status: DefaultStatus.INACTIVE },
      data: { status: DefaultStatus.ACTIVE },
    });
  }
}
