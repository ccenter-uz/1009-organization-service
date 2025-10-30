import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationCreateDto,
  NotificationUpdateDto,
  NotificationInterfaces,
  NotificationServiceCommands as Commands,
} from 'types/organization/notification';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestEnum,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { createPagination } from '@/common/helper/pagination.helper';
import { RegionService } from '../region/region.service';
import { CityFilterDto } from 'types/organization/city/dto/filter-city.dto';
import { Prisma } from '@prisma/client';
import { getCityData } from '@/common/helper/sql-rows-for-select/get-city-data.dto';
import { NotificationFilterDto } from 'types/organization/notification/dto/filter-notification.dto';
import { ORGANIZATION, USER } from 'types/config';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
@Injectable()
export class NotificationService {
  private logger = new Logger(NotificationService.name);
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CLIENT_GATEWAY') private readonly clientGateway: ClientProxy
  ) {}

  async create(
    data: NotificationCreateDto
  ): Promise<NotificationInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);


    const notification = await this.prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        organizationId: data.organizationId,
        organizationStatus: data.organizationStatus,
        userId: 1,
        status: DefaultStatus.ACTIVE,
      },
    });
    this.logger.debug(`Method: ${methodName} - Response: `, notification);


    const event: NotificationInterfaces.Response = {
      id: notification.id,
      status: notification.status,
      title: notification.title,
      message: notification.message,
      organizationId: notification.organizationId,
      organizationStatus: notification.organizationStatus,
      isRead: notification.isRead,
      userId: notification.userId,
    };


    this.clientGateway.emit<NotificationInterfaces.Response>(
      'notification.created',
      event
    );

    return notification;
  }

  async findAll(
    data: NotificationFilterDto
  ): Promise<NotificationInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.all) {
      const notification = await this.prisma.notification.findMany({
        where: {
          organizationId: data.organizationId,
          status: DefaultStatus.ACTIVE,
        },
      });
      return {
        data: notification,
        totalDocs: notification.length,
        totalPage: notification.length > 0 ? 1 : 0,
      };
    }

    const where: any = {
      ...(data.status == 2
        ? {}
        : {
            status: data.status,
          }),
      organizationId: data.organizationId,
    };

    if (!data.isRead) {
      where.isRead = false;
    }

    const count = await this.prisma.notification.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const notifications = await this.prisma.notification.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    });
    this.logger.debug(`Method: ${methodName} - Response: `, notifications);

    return {
      data: notifications,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<NotificationInterfaces.Response> {
    const methodName: string = this.findOne.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const notification = await this.prisma.notification.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
    });
    if (!notification) {
      throw new NotFoundException('notification is not found');
    }
    if (notification.isRead == false) {
      await this.prisma.notification.update({
        where: {
          id: notification.id,
        },
        data: {
          isRead: true,
        },
      });
    }
    this.logger.debug(`Method: ${methodName} - Response: `, notification);

    return notification;
  }

  async update(
    data: NotificationUpdateDto
  ): Promise<NotificationInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    if (data.allRead) {
      const notifications = await this.prisma.notification.updateMany({
        where: {
          organizationId: data.organizationId,
        },
        data: {
          isRead: true,
        },
      });
      return notifications[0];
    } else {
      const notification = await this.findOne({ id: data.id });

      const updatedNotification = await this.prisma.notification.update({
        where: {
          id: notification.id,
        },
        data: {
          title: data.title,
          message: data.message,
          organizationId: data.organizationId,
          userId: +data.userId,
          isRead: data.isRead,
        },
      });

      this.logger.debug(
        `Method: ${methodName} - Response: `,
        updatedNotification
      );

      return updatedNotification;
    }
  }

  async remove(data: DeleteDto): Promise<NotificationInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    if (data.delete) {
      const notification = await this.prisma.notification.delete({
        where: { id: data.id },
      });
      this.logger.debug(
        `Method: ${methodName} - Rresponse when delete true: `,
        notification
      );
      return notification;
    }

    const notification = await this.prisma.notification.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
    });

    this.logger.debug(
      `Method: ${methodName} - Rresponse when delete true: `,
      notification
    );
    return notification;
  }

  async restore(data: GetOneDto): Promise<NotificationInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const notification = this.prisma.notification.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
    });
    this.logger.debug(
      `Method: ${methodName} - Rresponse when delete true: `,
      notification
    );
    return notification;
  }
}
