import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  AdditionalTableCreateDto,
  AdditionalTableInterfaces,
  AdditionalTableUpdateDto,
} from 'types/organization/additional-table';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestEnum,
  StatusEnum,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { AdditionalTableFilterDto } from 'types/organization/additional-table/dto/filter-additional-table.dto';
import { AdditionalService } from '../additional/additional.service';

@Injectable()
export class AdditionalTableService {
  private logger = new Logger(AdditionalTableService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly additionalService: AdditionalService
  ) {}

  async create(
    data: AdditionalTableCreateDto
  ): Promise<AdditionalTableInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const additional = await this.additionalService.findOne({
      id: data.additionalId,
    });
    const additionalTable = await this.prisma.additionalTable.create({
      data: {
        additionalId: additional.id,
        status: StatusEnum.ACTIVE,
        AdditionalTableContentTranslations: {
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
        AdditionalTableNameTranslations: {
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
        AdditionalTableContentTranslations: true,
        AdditionalTableNameTranslations: true,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, data);

    return additionalTable;
  }

  async findAll(
    data: AdditionalTableFilterDto
  ): Promise<AdditionalTableInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    if (data.all) {
      const additionalTables = await this.prisma.additionalTable.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          additionalId: data.additionalId,
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
        },
        include: {
          AdditionalTableContentTranslations: {
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
          AdditionalTableNameTranslations: {
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

      const formattedCategories = [];

      for (let i = 0; i < additionalTables.length; i++) {
        const additionalTable = additionalTables[i];
        // content
        const content = formatLanguageResponse(
          additionalTable.AdditionalTableContentTranslations
        );
        delete additionalTable.AdditionalTableContentTranslations;

        // name
        const name = formatLanguageResponse(
          additionalTable.AdditionalTableNameTranslations
        );
        delete additionalTable.AdditionalTableNameTranslations;

        formattedCategories.push({ ...additionalTable, content, name });
      }

      this.logger.debug(
        `Method: ${methodName} -  Response: `,
        formattedCategories
      );

      return {
        data: formattedCategories,
        totalDocs: additionalTables.length,
        totalPage: 1,
      };
    }

    const where: any = {
      additionalId: data.additionalId,
      ...(data.status == 2
        ? {}
        : {
            status: data.status,
          }),
    };

    if (data.search) {
      where.AdditionalTableContentTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
            mode: 'insensitive',
          },
        },
      };
    }
    const count = await this.prisma.additionalTable.count({ where });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const additionalTables = await this.prisma.additionalTable.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        AdditionalTableContentTranslations: {
          where: data.allLang
            ? {}
            : {
                languageCode: data.langCode,
              },
          select: {
            name: true,
            languageCode: true,
          },
        },
        AdditionalTableNameTranslations: {
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
      take: pagination.take,
      skip: pagination.skip,
    });

    const formattedCategories = [];

    for (let i = 0; i < additionalTables.length; i++) {
      const additionalTable = additionalTables[i];
      // content
      const content = formatLanguageResponse(
        additionalTable.AdditionalTableContentTranslations
      );
      delete additionalTable.AdditionalTableContentTranslations;

      // name
      const name = formatLanguageResponse(
        additionalTable.AdditionalTableNameTranslations
      );
      delete additionalTable.AdditionalTableNameTranslations;

      formattedCategories.push({ ...additionalTable, content, name });
    }
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

  async findOne(
    data: GetOneDto
  ): Promise<AdditionalTableInterfaces.Response> {
    const methodName: string = this.findOne.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const additionalTable = await this.prisma.additionalTable.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        AdditionalTableContentTranslations: {
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
        AdditionalTableNameTranslations: {
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

    if (!additionalTable) {
      throw new NotFoundException('AdditionalTable is not found');
    }

    const content = formatLanguageResponse(
      additionalTable.AdditionalTableContentTranslations
    );

    delete additionalTable.AdditionalTableContentTranslations;

    const name = formatLanguageResponse(
      additionalTable.AdditionalTableNameTranslations
    );

    delete additionalTable.AdditionalTableNameTranslations;

    this.logger.debug(`Method: ${methodName} - Response: `, additionalTable);
    return { ...additionalTable, content, name };
  }

  async update(
    data: AdditionalTableUpdateDto
  ): Promise<AdditionalTableInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const additionalTable = await this.findOne({ id: data.id });

    const nameUpdates = [];

    if (data.name?.[LanguageRequestEnum.RU]) {
      nameUpdates.push({
        where: { languageCode: LanguageRequestEnum.RU },
        data: { name: data.name[LanguageRequestEnum.RU] },
      });
    }

    if (data.name?.[LanguageRequestEnum.UZ]) {
      nameUpdates.push({
        where: { languageCode: LanguageRequestEnum.UZ },
        data: { name: data.name[LanguageRequestEnum.UZ] },
      });
    }

    if (data.name?.[LanguageRequestEnum.CY]) {
      nameUpdates.push({
        where: { languageCode: LanguageRequestEnum.CY },
        data: { name: data.name[LanguageRequestEnum.CY] },
      });
    }

    const contentUpdates = [];

    if (data.content?.[LanguageRequestEnum.RU]) {
      contentUpdates.push({
        where: { languageCode: LanguageRequestEnum.RU },
        data: { name: data.content[LanguageRequestEnum.RU] },
      });
    }

    if (data.content?.[LanguageRequestEnum.UZ]) {
      contentUpdates.push({
        where: { languageCode: LanguageRequestEnum.UZ },
        data: { name: data.content[LanguageRequestEnum.UZ] },
      });
    }

    if (data.content?.[LanguageRequestEnum.CY]) {
      contentUpdates.push({
        where: { languageCode: LanguageRequestEnum.CY },
        data: { name: data.content[LanguageRequestEnum.CY] },
      });
    }

    const updatedAdditionalTable = await this.prisma.additionalTable.update(
      {
        where: {
          id: additionalTable.id,
        },
        data: {
          AdditionalTableNameTranslations: {
            updateMany: nameUpdates.length > 0 ? nameUpdates : undefined,
          },
          AdditionalTableContentTranslations: {
            updateMany: contentUpdates.length > 0 ? contentUpdates : undefined,
          },
        },
        include: {
          AdditionalTableContentTranslations: true,
          AdditionalTableNameTranslations: true,
        },
      }
    );

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedAdditionalTable
    );

    return updatedAdditionalTable;
  }

  async remove(data: DeleteDto): Promise<AdditionalTableInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    if (data.delete) {
      const additionalTable = await this.prisma.additionalTable.delete({
        where: { id: data.id },
        include: {
          AdditionalTableContentTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          AdditionalTableNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });

      this.logger.debug(
        `Method: ${methodName} - Rresponse when delete true: `,
        additionalTable
      );

      return additionalTable;
    }

    const additionalTable = await this.prisma.additionalTable.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        AdditionalTableContentTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AdditionalTableNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    this.logger.debug(
      `Method: ${methodName} - Rresponse when delete false: `,
      additionalTable
    );

    return additionalTable;
  }

  async restore(
    data: GetOneDto
  ): Promise<AdditionalTableInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const additionalTable = this.prisma.additionalTable.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        AdditionalTableContentTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AdditionalTableNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Rresponse: `, additionalTable);

    return additionalTable;
  }
}
