import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';

import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestEnum,
  ListQueryDto,
} from 'types/global';

import {
  PhoneTypeUpdateDto,
  PhoneTypeCreateDto,
  PhoneTypeInterfaces,
} from 'types/organization/phone-type';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { getSingleOrderedData } from '@/common/helper/sql-rows-for-select/get-single-ordered-data.dto';
import { Prisma } from '@prisma/client';
import { ListQueryWithOrderDto } from 'types/global/dto/list-query-with-order.dto';

@Injectable()
export class PhoneTypeService {
  private logger = new Logger(PhoneTypeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: PhoneTypeCreateDto
  ): Promise<PhoneTypeInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const phoneTypes = await this.prisma.phoneTypes.create({
      data: {
        staffNumber: data.staffNumber,
        orderNumber: data.orderNumber,
        PhoneTypesTranslations: {
          create: [
            {
              languageCode: LanguageRequestEnum.RU,
              name: data.name[LanguageRequestEnum.RU],
            },
            {
              languageCode: LanguageRequestEnum.UZ,
              name: data.name[LanguageRequestEnum.UZ],
            },
            {
              languageCode: LanguageRequestEnum.CY,
              name: data.name[LanguageRequestEnum.CY],
            },
          ],
        },
      },
      include: {
        PhoneTypesTranslations: true, // Include translations in the response
      },
    });
    this.logger.debug(`Method: ${methodName} - Response: `, phoneTypes);

    return phoneTypes;
  }

  async findAll(
    data: ListQueryWithOrderDto
  ): Promise<PhoneTypeInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const conditions: Prisma.Sql[] = [];
    if (data.status === 0 || data.status === 1)
      conditions.push(Prisma.sql`c.status = ${data.status}`);
    if (data.search) {
      conditions.push(Prisma.sql`
          EXISTS (
            SELECT 1
            FROM phone_types_id_translations ct
            WHERE ct.phone_types_id = c.id
              AND ct.name ILIKE ${`%${data.search}%`}
            ORDER BY ct.language_code   
            LIMIT 1
          )
        `);
    }

    if (data.all) {
      const phoneType = await getSingleOrderedData(
        'PhoneTypes',
        'phone_types',
        this.prisma,
        data,
        conditions
      );

      const formattedPhoneTypes = phoneType.map((productServiceCategory) => {
        const translations = productServiceCategory.PhoneTypesTranslations;

        const name = formatLanguageResponse(translations);
        delete productServiceCategory.PhoneTypesTranslations;

        return { ...productServiceCategory, name };
      });
      this.logger.debug(
        `Method: ${methodName} - Response: `,
        formattedPhoneTypes
      );

      return {
        data: formattedPhoneTypes,
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
      where.PhoneTypesTranslations = {
        some: {
          name: {
            contains: data.search,
            mode: 'insensitive',
          },
        },
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

    const phoneType = await getSingleOrderedData(
      'PhoneTypes',
      'phone_types',
      this.prisma,
      data,
      conditions,
      pagination
    );

    const formattedCategories = phoneType.map((productServiceCategory) => {
      const translations = productServiceCategory.PhoneTypesTranslations;

      const name = formatLanguageResponse(translations);
      delete productServiceCategory.PhoneTypesTranslations;

      return { ...productServiceCategory, name };
    });
    this.logger.debug(
      `Method: ${methodName} - Response: `,
      formattedCategories
    );
    return {
      data: formattedCategories,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<PhoneTypeInterfaces.Response> {
    const methodName: string = this.findOne.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const phoneType = await this.prisma.phoneTypes.findFirst({
      where: {
        id: data.id,

        status: DefaultStatus.ACTIVE,
      },
      include: {
        PhoneTypesTranslations: {
          where: data.allLang
            ? {}
            : {
                languageCode: data.langCode, // langCode from request
              },
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    if (!phoneType) {
      throw new NotFoundException('Phone Type is not found');
    }

    const name = formatLanguageResponse(phoneType.PhoneTypesTranslations);
    delete phoneType.PhoneTypesTranslations;
    this.logger.debug(`Method: ${methodName} - Response: `, phoneType);

    return { ...phoneType, name };
  }

  async update(
    data: PhoneTypeUpdateDto
  ): Promise<PhoneTypeInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const phoneType = await this.findOne({ id: data.id });

    const updatedPhoneType = await this.prisma.phoneTypes.update({
      where: {
        id: phoneType.id,
      },
      data: {
        staffNumber: data.staffNumber,
        orderNumber: data.orderNumber,
        PhoneTypesTranslations: {
          updateMany: [
            {
              where: { languageCode: LanguageRequestEnum.RU },
              data: { name: data.name[LanguageRequestEnum.RU] },
            },
            {
              where: { languageCode: LanguageRequestEnum.UZ },
              data: { name: data.name[LanguageRequestEnum.UZ] },
            },
            {
              where: { languageCode: LanguageRequestEnum.CY },
              data: { name: data.name[LanguageRequestEnum.CY] },
            },
          ],
        },
      },
      include: {
        PhoneTypesTranslations: true, // Include translations in the response
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updatedPhoneType);

    return updatedPhoneType;
  }

  async remove(data: DeleteDto): Promise<PhoneTypeInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.delete) {
      const deletedPhoneType = await this.prisma.phoneTypes.delete({
        where: { id: data.id },
        include: {
          PhoneTypesTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
      this.logger.debug(`Method: ${methodName} - Response: `, deletedPhoneType);

      return deletedPhoneType;
    }

    const updatedPhoneType = await this.prisma.phoneTypes.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        PhoneTypesTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updatedPhoneType);

    return updatedPhoneType;
  }

  async restore(data: GetOneDto): Promise<PhoneTypeInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const updatedPhoneType = this.prisma.phoneTypes.update({
      where: { id: data.id, status: DefaultStatus.INACTIVE },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        PhoneTypesTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updatedPhoneType);

    return updatedPhoneType;
  }
}
