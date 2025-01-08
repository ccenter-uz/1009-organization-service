import { Injectable, NotFoundException } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  LanguageRequestEnum,
  ListQueryDto,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import {
  SegmentCreateDto,
  SegmentInterfaces,
  SegmentUpdateDto,
} from 'types/organization/segment';

@Injectable()
export class SegmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: SegmentCreateDto): Promise<SegmentInterfaces.Response> {
    const segment = await this.prisma.segment.create({
      data: {
        name: data.name,
      },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        deletedAt: true,
        updatedAt: true,
      },
    });
    return segment;
  }

  async findAll(
    data: ListQueryDto
  ): Promise<SegmentInterfaces.ResponseWithPagination> {
    if (data.all) {
      const segments = await this.prisma.segment.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
        },
      });

      return {
        data: segments,
        totalDocs: segments.length,
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
      where.name = data.search;
    }

    const count = await this.prisma.segment.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const categories = await this.prisma.segment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
    });

    return {
      data: categories,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<SegmentInterfaces.Response> {
    const segment = await this.prisma.segment.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {},
    });

    if (!segment) {
      throw new NotFoundException('Segment is not found');
    }

    return segment;
  }

  async update(data: SegmentUpdateDto): Promise<SegmentInterfaces.Response> {
    const category = await this.findOne({ id: data.id });

    return await this.prisma.segment.update({
      where: {
        id: category.id,
      },
      data: {
        name: data.name,
      },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        deletedAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(data: DeleteDto): Promise<SegmentInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.segment.delete({
        where: { id: data.id },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          deletedAt: true,
          updatedAt: true,
        },
      });
    }

    return await this.prisma.segment.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        deletedAt: true,
        updatedAt: true,
      },
    });
  }

  async restore(data: GetOneDto): Promise<SegmentInterfaces.Response> {
    return this.prisma.segment.update({
      where: { id: data.id, status: DefaultStatus.INACTIVE },
      data: { status: DefaultStatus.ACTIVE },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        deletedAt: true,
        updatedAt: true,
      },
    });
  }
}
