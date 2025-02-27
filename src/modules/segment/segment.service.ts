import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  ListQueryDto,
} from 'types/global';
import {
  SegmentCreateDto,
  SegmentInterfaces,
  SegmentUpdateDto,
} from 'types/organization/segment';
import { ListQueryWithOrderDto } from 'types/global/dto/list-query-with-order.dto';

@Injectable()
export class SegmentService {
  private logger = new Logger(SegmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: SegmentCreateDto): Promise<SegmentInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const segment = await this.prisma.segment.create({
      data: {
        name: data.name,
        orderNumber: data.orderNumber,
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
    this.logger.debug(`Method: ${methodName} - Response: `, segment);

    return segment;
  }

  async findAll(
    data: ListQueryWithOrderDto
  ): Promise<SegmentInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.all) {
      const segments = await this.prisma.segment.findMany({
        orderBy:
          data.order === 'name'
            ? [
                { name: 'asc' },
                {
                  orderNumber: 'asc',
                },
              ]
            : [
                {
                  orderNumber: 'asc',
                },
                { name: 'asc' },
              ],
        where: {
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
        },
      });
      this.logger.debug(`Method: ${methodName} - Response: `, segments);

      return {
        data: segments,
        totalDocs: segments.length,
        totalPage: segments.length > 0 ? 1 : 0,
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
      orderBy:
        data.order === 'name'
          ? [
              { name: 'asc' },
              {
                orderNumber: 'asc',
              },
            ]
          : [
              {
                orderNumber: 'asc',
              },
              { name: 'asc' },
            ],
      take: pagination.take,
      skip: pagination.skip,
    });
    this.logger.debug(`Method: ${methodName} - Response: `, categories);

    return {
      data: categories,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<SegmentInterfaces.Response> {
    const methodName: string = this.findOne.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
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
    this.logger.debug(`Method: ${methodName} - Response: `, segment);

    return segment;
  }

  async update(data: SegmentUpdateDto): Promise<SegmentInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const category = await this.findOne({ id: data.id });

    const updatedSegment = await this.prisma.segment.update({
      where: {
        id: category.id,
      },
      data: {
        name: data.name,
        orderNumber: data.orderNumber,
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

    this.logger.debug(`Method: ${methodName} - Response: `, updatedSegment);

    return updatedSegment;
  }

  async remove(data: DeleteDto): Promise<SegmentInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.delete) {
      const deletedSegment = await this.prisma.segment.delete({
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

      this.logger.debug(`Method: ${methodName} - Response: `, deletedSegment);

      return deletedSegment;
    }

    const updatedSegment = await this.prisma.segment.update({
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

    this.logger.debug(`Method: ${methodName} - Response: `, updatedSegment);

    return updatedSegment;
  }

  async restore(data: GetOneDto): Promise<SegmentInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const updatedSegment = this.prisma.segment.update({
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

    this.logger.debug(`Method: ${methodName} - Response: `, updatedSegment);

    return updatedSegment;
  }
}
