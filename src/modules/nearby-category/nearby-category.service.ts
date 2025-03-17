import { Injectable, NotFoundException, Logger } from '@nestjs/common';
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
import { ListQueryWithOrderDto } from 'types/global/dto/list-query-with-order.dto';

@Injectable()
export class NearbyCategoryService {
  private logger = new Logger(NearbyCategoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: NearbyCategoryCreateDto
  ): Promise<NearbyCategoryInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const nearbyCategory = await this.prisma.nearbyCategory.create({
      data: {
        staffNumber: data.staffNumber,
        name: data.name,
        orderNumber: data.orderNumber,
      },
    });
    this.logger.debug(`Method: ${methodName} - Response: `, nearbyCategory);

    return nearbyCategory;
  }

  async findAll(
    data: ListQueryWithOrderDto
  ): Promise<NearbyCategoryInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.all) {
      const nearbyCategry = await this.prisma.nearbyCategory.findMany({
        where: {
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
        },
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
      });
      this.logger.debug(`Method: ${methodName} - Response: `, nearbyCategry);

      return {
        data: nearbyCategry,
        totalDocs: nearbyCategry.length,
        totalPage: nearbyCategry.length > 0 ? 1 : 0,
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
    this.logger.debug(`Method: ${methodName} - Response: `, nearby);

    return {
      data: nearby,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<NearbyCategoryInterfaces.Response> {
    const methodName: string = this.findOne.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const nearbyCategry = await this.prisma.nearbyCategory.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
    });

    if (!nearbyCategry) {
      throw new NotFoundException('Nearby Category is not found');
    }
    this.logger.debug(`Method: ${methodName} - Response: `, nearbyCategry);

    return nearbyCategry;
  }

  async update(
    data: NearbyCategoryUpdateDto
  ): Promise<NearbyCategoryInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const nearbyCategry = await this.findOne({ id: data.id });

    const updatedNearbyCategory = await this.prisma.nearbyCategory.update({
      where: {
        id: nearbyCategry.id,
      },
      data: {
        editedStaffNumber: data.staffNumber,
        name: data.name,
        orderNumber: data.orderNumber,
      },
    });

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedNearbyCategory
    );
    return updatedNearbyCategory;
  }

  async remove(data: DeleteDto): Promise<NearbyCategoryInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.delete) {
      const deletedNearbyCategory = await this.prisma.nearbyCategory.delete({
        where: { id: data.id },
      });

      this.logger.debug(
        `Method: ${methodName} - Response: `,
        deletedNearbyCategory
      );
      return deletedNearbyCategory;
    }

    const updatedNearbyCategory = await this.prisma.nearbyCategory.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
    });

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedNearbyCategory
    );
    return updatedNearbyCategory;
  }

  async restore(data: GetOneDto): Promise<NearbyCategoryInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const updatedNearbyCategory = this.prisma.nearbyCategory.update({
      where: { id: data.id, status: DefaultStatus.INACTIVE },
      data: { status: DefaultStatus.ACTIVE },
    });

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedNearbyCategory
    );
    return updatedNearbyCategory;
  }
}
