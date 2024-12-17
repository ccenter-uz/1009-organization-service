import { Injectable, NotFoundException } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';

import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  ListQueryDto,
} from 'types/global';

import {
  PhoneTypeUpdateDto,
  PhoneTypeCreateDto,
  PhoneTypeInterfaces,
} from 'types/organization/phone-type';

@Injectable()
export class PhoneTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: PhoneTypeCreateDto
  ): Promise<PhoneTypeInterfaces.Response> {
    const phoneTypes = await this.prisma.phoneTypes.create({
      data: {
        staffNumber: data.staffNumber,
        name: data.name,
      },
    });
    return phoneTypes;
  }

  async findAll(
    data: ListQueryDto
  ): Promise<PhoneTypeInterfaces.ResponseWithPagination> {
    if (data.all) {
      const phoneType = await this.prisma.phoneTypes.findMany({
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
        data: phoneType,
        totalDocs: phoneType.length,
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
      };
    }
    const count = await this.prisma.phoneTypes.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });


    const phoneType = await this.prisma.phoneTypes.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
    });

    return {
      data: phoneType,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<PhoneTypeInterfaces.Response> {
    const phoneType = await this.prisma.phoneTypes.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
    });

    if (!phoneType) {
      throw new NotFoundException('Phone Type is not found');
    }

    return phoneType;
  }

  async update(
    data: PhoneTypeUpdateDto
  ): Promise<PhoneTypeInterfaces.Response> {
    const phoneType = await this.findOne({ id: data.id });

    return await this.prisma.phoneTypes.update({
      where: {
        id: phoneType.id,
      },
      data: {
        staffNumber: data.staffNumber,
        name: data.name,
      },
    });
  }

  async remove(data: DeleteDto): Promise<PhoneTypeInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.phoneTypes.delete({
        where: { id: data.id },
      });
    }

    return await this.prisma.phoneTypes.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
    });
  }

  async restore(data: GetOneDto): Promise<PhoneTypeInterfaces.Response> {
    return this.prisma.phoneTypes.update({
      where: { id: data.id, status: DefaultStatus.INACTIVE },
      data: { status: DefaultStatus.ACTIVE },
    });
  }
}
