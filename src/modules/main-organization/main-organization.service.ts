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
  MainOrganizationCreateDto,
  MainOrganizationInterfaces,
  MainOrganizationUpdateDto,
} from 'types/organization/main-organization';
import { ListQueryWithOrderDto } from 'types/global/dto/list-query-with-order.dto';

@Injectable()
export class MainOrganizationService {
  private logger = new Logger(MainOrganizationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: MainOrganizationCreateDto
  ): Promise<MainOrganizationInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const mainOrganization = await this.prisma.mainOrganization.create({
      data: {
        staffNumber: data.staffNumber,
        name: data.name,
        orderNumber: data.orderNumber,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, mainOrganization);    

    return mainOrganization;
  }

  async findAll(
    data: ListQueryWithOrderDto
  ): Promise<MainOrganizationInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
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
      this.logger.debug(`Method: ${methodName} - Response: `, mainOrganization);

      return {
        data: mainOrganization,
        totalDocs: mainOrganization.length,
        totalPage: mainOrganization.length > 0 ? 1 : 0,
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
    this.logger.debug(`Method: ${methodName} -  Response: `, mainOrganization);
    return {
      data: mainOrganization,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<MainOrganizationInterfaces.Response> {
    const methodName: string = this.findOne.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const mainOrganization = await this.prisma.mainOrganization.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
    });

    if (!mainOrganization) {
      throw new NotFoundException('Main Organization is not found');
    }
    this.logger.debug(`Method: ${methodName} - Response: `, mainOrganization);
    return mainOrganization;
  }

  async update(
    data: MainOrganizationUpdateDto
  ): Promise<MainOrganizationInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const mainOrganization = await this.findOne({ id: data.id });

    const updatedMainOrganization = await this.prisma.mainOrganization.update({
      where: {
        id: mainOrganization.id,
      },
      data: {
        staffNumber: data.staffNumber,
        name: data.name,
        orderNumber: data.orderNumber,
      },
    });

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedMainOrganization
    );

    return updatedMainOrganization;
  }

  async remove(data: DeleteDto): Promise<MainOrganizationInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.delete) {
      const deletedMainOrganization = await this.prisma.mainOrganization.delete(
        {
          where: { id: data.id },
        }
      );

      this.logger.debug(
        `Method: ${methodName} - Response: `,
        deletedMainOrganization
      );

      return deletedMainOrganization;
    }

    const updatedMainOrganization = await this.prisma.mainOrganization.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
    });

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedMainOrganization
    );

    return updatedMainOrganization;
  }

  async restore(data: GetOneDto): Promise<MainOrganizationInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const updatedMainOrganization = this.prisma.mainOrganization.update({
      where: { id: data.id, status: DefaultStatus.INACTIVE },
      data: { status: DefaultStatus.ACTIVE },
    });

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedMainOrganization
    );

    return updatedMainOrganization;
  }
}
