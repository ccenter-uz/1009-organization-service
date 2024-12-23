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
  NearbyCategoryUpdateDto,
  NearbyCategoryCreateDto,
  NearbyCategoryInterfaces,
} from 'types/organization/nearby-category';

@Injectable()
export class NearbyCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: NearbyCategoryCreateDto
  ): Promise<NearbyCategoryInterfaces.Response> {
    // const mainOrganization = await this.prisma.mainOrganization
    const nearbyCategory = await this.prisma.nearbyCategory.create({
      data: {
        staffNumber: data.staffNumber,
        name: data.name,
      },
    });
    return nearbyCategory;
  }

  async findAll(
    data: ListQueryDto
  ): Promise<NearbyCategoryInterfaces.ResponseWithPagination> {
    if (data.all) {
      const nearbyCategry = await this.prisma.nearbyCategory.findMany({
        where: {
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        data: nearbyCategry,
        totalDocs: nearbyCategry.length,
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
    const count = await this.prisma.nearbyCategory.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });


    const nearby = await this.prisma.nearbyCategory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
    });

    return {
      data: nearby,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<NearbyCategoryInterfaces.Response> {
    const nearbyCategry = await this.prisma.nearbyCategory.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
    });

    if (!nearbyCategry) {
      throw new NotFoundException('Nearby Category is not found');
    }

    return nearbyCategry;
  }

  async update(
    data: NearbyCategoryUpdateDto
  ): Promise<NearbyCategoryInterfaces.Response> {
    const nearbyCategry = await this.findOne({ id: data.id });

    return await this.prisma.nearbyCategory.update({
      where: {
        id: nearbyCategry.id,
      },
      data: {
        staffNumber: data.staffNumber,
        name: data.name,
      },
    });
  }

  async remove(data: DeleteDto): Promise<NearbyCategoryInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.nearbyCategory.delete({
        where: { id: data.id },
      });
    }

    return await this.prisma.nearbyCategory.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
    });
  }

  async restore(data: GetOneDto): Promise<NearbyCategoryInterfaces.Response> {
    return this.prisma.nearbyCategory.update({
      where: { id: data.id, status: DefaultStatus.INACTIVE },
      data: { status: DefaultStatus.ACTIVE },
    });
  }
}
