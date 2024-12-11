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
  SectionCreateDto,
  SectionInterfaces,
  SectionUpdateDto,
} from 'types/organization/section';

@Injectable()
export class SectionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: SectionCreateDto): Promise<SectionInterfaces.Response> {
    // const mainOrganization = await this.prisma.mainOrganization
    const section = await this.prisma.section.create({
      data: {
        name: data.name,
      },
    });
    return section;
  }

  async findAll(
    data: ListQueryDto
  ): Promise<SectionInterfaces.ResponseWithPagination> {
    if (data.all) {
      const section = await this.prisma.section.findMany({
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
        data: section,
        totalDocs: section.length,
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
    const count = await this.prisma.section.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const section = await this.prisma.section.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
    });

    return {
      data: section,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<SectionInterfaces.Response> {
    const section = await this.prisma.section.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
    });

    if (!section) {
      throw new NotFoundException('Section is not found');
    }

    return section;
  }

  async update(data: SectionUpdateDto): Promise<SectionInterfaces.Response> {
    const section = await this.findOne({ id: data.id });

    return await this.prisma.section.update({
      where: {
        id: section.id,
      },
      data: {
        name: data.name || section.name,
      },
    });
  }

  async remove(data: DeleteDto): Promise<SectionInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.section.delete({
        where: { id: data.id },
      });
    }

    return await this.prisma.section.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
    });
  }

  async restore(data: GetOneDto): Promise<SectionInterfaces.Response> {
    return this.prisma.section.update({
      where: { id: data.id, status: DefaultStatus.INACTIVE },
      data: { status: DefaultStatus.ACTIVE },
    });
  }
}
