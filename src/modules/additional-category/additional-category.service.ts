import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  AdditionalCategoryCreateDto,
  AdditionalCategoryInterfaces,
  AdditionalCategoryUpdateDto,
} from 'types/organization/additional-category';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestEnum,
  ListQueryDto,
  StatusEnum,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { Prisma } from '@prisma/client';
import { getSingleData } from '@/common/helper/sql-rows-for-select/get-single-data.dto';

@Injectable()
export class AdditionalCategoryService {
  private logger = new Logger(AdditionalCategoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: AdditionalCategoryCreateDto
  ): Promise<AdditionalCategoryInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const additionalCategory = await this.prisma.additionalCategory.create({
      data: {
        staffNumber: data.staffNumber,
        status: StatusEnum.ACTIVE,
        AdditionalCategoryTranslations: {
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
        AdditionalCategoryTranslations: true,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, data);

    return additionalCategory;
  }

  async findAll(
    data: ListQueryDto
  ): Promise<AdditionalCategoryInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const conditions: Prisma.Sql[] = [];
    if (data.status === 0 || data.status === 1)
      conditions.push(Prisma.sql`c.status = ${data.status}`);
    if (data.search) {
      conditions.push(Prisma.sql`
                  EXISTS (
                    SELECT 1
                    FROM additional_category_translations ct
                    WHERE ct.additional_category_id = c.id
                      AND ct.name ILIKE ${`%${data.search}%`}
                    ORDER BY ct.language_code   
                    LIMIT 1
                  )
                `);
    }
    if (data.all) {
      const additionalCategories = await getSingleData(
        'AdditionalCategory',
        'additional_category',
        this.prisma,
        data,
        conditions
      );



      this.logger.debug(
        `Method: ${methodName} -  Response: `,
        additionalCategories
      );

      return {
        data: additionalCategories,
        totalDocs: additionalCategories.length,
        totalPage: additionalCategories.length > 0 ? 1 : 0,
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
      where.AdditionalCategoryTranslations = {
        some: {
          name: {
            contains: data.search,
            mode: 'insensitive',
          },
        },
      };
    }
    const count = await this.prisma.additionalCategory.count({ where });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const additionalCategories = await getSingleData(
      'AdditionalCategory',
      'additional_category',
      this.prisma,
      data,
      conditions,
      pagination
    );

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      additionalCategories
    );

    return {
      data: additionalCategories,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(
    data: GetOneDto
  ): Promise<AdditionalCategoryInterfaces.Response> {
    const methodName: string = this.findOne.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const additionalCategory = await this.prisma.additionalCategory.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        AdditionalCategoryTranslations: {
          where: data.allLang
            ? {}
            : {
                languageCode: data.langCode,
              },
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    if (!additionalCategory) {
      throw new NotFoundException('AdditionalCategory is not found');
    }

    const name = formatLanguageResponse(
      additionalCategory.AdditionalCategoryTranslations
    );

    this.logger.debug(`Method: ${methodName} - Response: `, additionalCategory);
    delete additionalCategory.AdditionalCategoryTranslations;

    return { ...additionalCategory, name };
  }

  async update(
    data: AdditionalCategoryUpdateDto
  ): Promise<AdditionalCategoryInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const additionalCategory = await this.findOne({ id: data.id });

    const translationUpdates = [];

    if (data.name?.[LanguageRequestEnum.RU]) {
      translationUpdates.push({
        where: { languageCode: LanguageRequestEnum.RU },
        data: { name: data.name[LanguageRequestEnum.RU] },
      });
    }

    if (data.name?.[LanguageRequestEnum.UZ]) {
      translationUpdates.push({
        where: { languageCode: LanguageRequestEnum.UZ },
        data: { name: data.name[LanguageRequestEnum.UZ] },
      });
    }

    if (data.name?.[LanguageRequestEnum.CY]) {
      translationUpdates.push({
        where: { languageCode: LanguageRequestEnum.CY },
        data: { name: data.name[LanguageRequestEnum.CY] },
      });
    }

    const updatedAdditionalCategory =
      await this.prisma.additionalCategory.update({
        where: {
          id: additionalCategory.id,
        },
        data: {
          editedStaffNumber: data.staffNumber ,
          AdditionalCategoryTranslations: {
            updateMany:
              translationUpdates.length > 0 ? translationUpdates : undefined,
          },
        },
        include: {
          AdditionalCategoryTranslations: true,
        },
      });

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedAdditionalCategory
    );

    return updatedAdditionalCategory;
  }

  async remove(
    data: DeleteDto
  ): Promise<AdditionalCategoryInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    if (data.delete) {
      const additionalCategory = await this.prisma.additionalCategory.delete({
        where: { id: data.id },
        include: {
          AdditionalCategoryTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });

      this.logger.debug(
        `Method: ${methodName} - Rresponse when delete true: `,
        additionalCategory
      );

      return additionalCategory;
    }

    const additionalCategory = await this.prisma.additionalCategory.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        AdditionalCategoryTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    this.logger.debug(
      `Method: ${methodName} - Rresponse when delete false: `,
      additionalCategory
    );

    return additionalCategory;
  }

  async restore(
    data: GetOneDto
  ): Promise<AdditionalCategoryInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const additionalCategory = this.prisma.additionalCategory.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        AdditionalCategoryTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    this.logger.debug(
      `Method: ${methodName} - Rresponse: `,
      additionalCategory
    );

    return additionalCategory;
  }
}
