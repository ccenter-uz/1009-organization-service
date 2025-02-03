import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  AdditionalCreateDto,
  AdditionalInterfaces,
  AdditionalUpdateDto,
} from 'types/organization/additional';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestEnum,
  StatusEnum,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { AdditionalFilterDto } from 'types/organization/additional/dto/filter-additional.dto';
import { AdditionalCategoryService } from '../additional-category/additional-category.service';
import { getAllAdditional } from '@/common/helper/sql-rows-for-select/get-ordered-additional-data.dto';

@Injectable()
export class AdditionalService {
  private logger = new Logger(AdditionalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly additionalCategory: AdditionalCategoryService
  ) {}

  async create(
    data: AdditionalCreateDto
  ): Promise<AdditionalInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const additionalCategory = await this.additionalCategory.findOne({
      id: data.additionalCategoryId,
    });

    const additional = await this.prisma.additional.create({
      data: {
        staffNumber: data.staffNumber,
        additionalCategoryId: additionalCategory.id,
        status: StatusEnum.ACTIVE,
        AdditionalTranslations: {
          create: Object.values(LanguageRequestEnum).map((lang) => ({
            languageCode: lang,
            name: data.name[lang],
          })),
        },
        AdditionalWarningTranslations: {
          create: Object.values(LanguageRequestEnum).map((lang) => ({
            languageCode: lang,
            name: data.warning[lang],
          })),
        },
        AdditionalMentionTranslations: {
          create: Object.values(LanguageRequestEnum).map((lang) => ({
            languageCode: lang,
            name: data.mention[lang],
          })),
        },
        AdditionalTable: {
          create: data.table.map((tableItem) => ({
            status: StatusEnum.ACTIVE,
            AdditionalTableContentTranslations: {
              create: Object.values(LanguageRequestEnum).map((lang) => ({
                languageCode: lang,
                name: tableItem.name[lang],
              })),
            },
            AdditionalTableNameTranslations: {
              create: Object.values(LanguageRequestEnum).map((lang) => ({
                languageCode: lang,
                name: tableItem.name[lang],
              })),
            },
          })),
        },
        AdditionalContent: {
          create: data.content.map((contentItem) => ({
            status: StatusEnum.ACTIVE,
            AdditionalContentContentTranslations: {
              create: Object.values(LanguageRequestEnum).map((lang) => ({
                languageCode: lang,
                name: contentItem.name[lang],
              })),
            },
            AdditionalContentNameTranslations: {
              create: Object.values(LanguageRequestEnum).map((lang) => ({
                languageCode: lang,
                name: contentItem.name[lang],
              })),
            },
          })),
        },
      },
      include: {
        AdditionalTranslations: true,
        AdditionalContent: {
          include: {
            AdditionalContentContentTranslations: true,
            AdditionalContentNameTranslations: true,
          },
        },
        AdditionalTable: {
          include: {
            AdditionalTableContentTranslations: true,
            AdditionalTableNameTranslations: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, data);

    return additional;
  }

  async findAll(
    data: AdditionalFilterDto
  ): Promise<AdditionalInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    if (data.all) {
      const additionals = await this.prisma.additional.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
        },
        include: {
          AdditionalTranslations: {
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
          AdditionalMentionTranslations: {
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
          AdditionalWarningTranslations: {
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

      for (let i = 0; i < additionals.length; i++) {
        const additional = additionals[i];

        const translations = additional.AdditionalTranslations;
        const name = formatLanguageResponse(translations);
        delete additional.AdditionalTranslations;

        const translationsWarning = additional.AdditionalWarningTranslations;
        const warning = formatLanguageResponse(translationsWarning);
        delete additional.AdditionalWarningTranslations;

        const translationsMention = additional.AdditionalMentionTranslations;
        const mention = formatLanguageResponse(translationsMention);
        delete additional.AdditionalMentionTranslations;

        formattedCategories.push({ ...additional, name, warning, mention });
      }

      this.logger.debug(
        `Method: ${methodName} -  Response: `,
        formattedCategories
      );

      return {
        data: formattedCategories,
        totalDocs: additionals.length,
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
      where.AdditionalTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
            mode: 'insensitive',
          },
        },
      };
    }
    const count = await this.prisma.additional.count({ where });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });
    let ress = await getAllAdditional(this.prisma, data, pagination);
    console.log('123123:', ress);

    const additionals = await this.prisma.additional.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        AdditionalTranslations: {
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
        AdditionalMentionTranslations: {
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
        AdditionalWarningTranslations: {
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

    for (let i = 0; i < additionals.length; i++) {
      const additional = additionals[i];

      const translations = additional.AdditionalTranslations;
      const name = formatLanguageResponse(translations);
      delete additional.AdditionalTranslations;

      const translationsWarning = additional.AdditionalWarningTranslations;
      const warning = formatLanguageResponse(translationsWarning);
      delete additional.AdditionalWarningTranslations;

      const translationsMention = additional.AdditionalMentionTranslations;
      const mention = formatLanguageResponse(translationsMention);
      delete additional.AdditionalMentionTranslations;

      formattedCategories.push({ ...additional, name, warning, mention });
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

  async findOne(data: GetOneDto): Promise<AdditionalInterfaces.Response> {
    const methodName: string = this.findOne.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const additional = await this.prisma.additional.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        AdditionalTranslations: {
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
        AdditionalMentionTranslations: {
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
        AdditionalWarningTranslations: {
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
        AdditionalContent: {
          include: {
            AdditionalContentContentTranslations: {
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
            AdditionalContentNameTranslations: {
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
        },
        AdditionalTable: {
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
        },
        AdditionalCategory: {
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
        },
      },
    });

    if (!additional) {
      throw new NotFoundException('Additional is not found');
    }

    const name = formatLanguageResponse(additional.AdditionalTranslations);
    delete additional.AdditionalTranslations;

    const warning = formatLanguageResponse(
      additional.AdditionalWarningTranslations
    );
    delete additional.AdditionalWarningTranslations;

    const mention = formatLanguageResponse(
      additional.AdditionalMentionTranslations
    );
    delete additional.AdditionalMentionTranslations;

    let formatedData: any = {
      ...additional,
      name,
      warning,
      mention,
      content: [],
      table: [],
    };

    const categoryName = formatLanguageResponse(
      additional.AdditionalCategory.AdditionalCategoryTranslations
    );

    formatedData.category = {
      ...additional.AdditionalCategory,
      name: categoryName,
    };

    delete formatedData.category.AdditionalCategoryTranslations;
    delete formatedData.AdditionalCategory;

    for (let i = 0; i < additional.AdditionalContent.length; i++) {
      const contentName = formatLanguageResponse(
        additional.AdditionalContent?.[i]?.[
          'AdditionalContentContentTranslations'
        ]
      );
      delete additional.AdditionalContent?.[i]?.[
        'AdditionalContentContentTranslations'
      ];
      const contentContent = formatLanguageResponse(
        additional.AdditionalContent?.[i]?.['AdditionalContentNameTranslations']
      );
      delete additional.AdditionalContent?.[i]?.[
        'AdditionalContentNameTranslations'
      ];

      formatedData.content.push({
        ...additional.AdditionalContent?.[i],
        name: contentName,
        content: contentContent,
      });
    }

    for (let i = 0; i < additional.AdditionalTable.length; i++) {
      const tableName = formatLanguageResponse(
        additional.AdditionalTable?.[i]?.['AdditionalTableContentTranslations']
      );
      delete additional.AdditionalTable?.[i]?.[
        'AdditionalTableContentTranslations'
      ];
      const tableContent = formatLanguageResponse(
        additional.AdditionalTable?.[i]?.['AdditionalTableNameTranslations']
      );
      delete additional.AdditionalTable?.[i]?.[
        'AdditionalTableNameTranslations'
      ];

      formatedData.table.push({
        ...additional.AdditionalTable?.[i],
        name: tableName,
        content: tableContent,
      });
    }
    delete formatedData.AdditionalTable;

    delete formatedData.AdditionalContent;
    this.logger.debug(`Method: ${methodName} - Response: `, additional);

    return formatedData;
  }

  async update(
    data: AdditionalUpdateDto
  ): Promise<AdditionalInterfaces.Response> {
    const methodName: string = this.update.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const additional = await this.findOne({ id: data.id });

    const generateUpdates = (field: any) =>
      Object.values(LanguageRequestEnum)
        .filter((lang) => field?.[lang])
        .map((lang) => ({
          where: { languageCode: lang },
          data: { name: field[lang] },
        }));

    await this.prisma.additionalContent.deleteMany({
      where: { additionalId: additional.id },
    });
    await this.prisma.additionalTable.deleteMany({
      where: { additionalId: additional.id },
    });
    const updatedAdditional = await this.prisma.additional.update({
      where: { id: additional.id },
      data: {
        staffNumber: data.staffNumber || additional.staffNumber,
        AdditionalTranslations: {
          updateMany: generateUpdates(data.name),
        },
        AdditionalWarningTranslations: {
          updateMany: generateUpdates(data.warning),
        },
        AdditionalMentionTranslations: {
          updateMany: generateUpdates(data.mention),
        },
        AdditionalTable: {
          create: data.table.map((tableItem) => ({
            status: StatusEnum.ACTIVE,
            AdditionalTableContentTranslations: {
              create: Object.values(LanguageRequestEnum).map((lang) => ({
                languageCode: lang,
                name: tableItem.name[lang],
              })),
            },
            AdditionalTableNameTranslations: {
              create: Object.values(LanguageRequestEnum).map((lang) => ({
                languageCode: lang,
                name: tableItem.name[lang],
              })),
            },
          })),
        },
        AdditionalContent: {
          create: data.content.map((contentItem) => ({
            status: StatusEnum.ACTIVE,
            AdditionalContentContentTranslations: {
              create: Object.values(LanguageRequestEnum).map((lang) => ({
                languageCode: lang,
                name: contentItem.name[lang],
              })),
            },
            AdditionalContentNameTranslations: {
              create: Object.values(LanguageRequestEnum).map((lang) => ({
                languageCode: lang,
                name: contentItem.name[lang],
              })),
            },
          })),
        },
      },
      include: {
        AdditionalTranslations: true,
        AdditionalWarningTranslations: true,
        AdditionalMentionTranslations: true,
        AdditionalTable: {
          include: {
            AdditionalTableContentTranslations: true,
            AdditionalTableNameTranslations: true,
          },
        },
        AdditionalContent: {
          include: {
            AdditionalContentContentTranslations: true,
            AdditionalContentNameTranslations: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updatedAdditional);
    return updatedAdditional;
  }

  async remove(data: DeleteDto): Promise<AdditionalInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const additionalFound = await this.prisma.additional.findFirst({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
    });

    if (data.delete) {
      const additional = await this.prisma.additional.delete({
        where: { id: data.id },
        include: {
          AdditionalTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          AdditionalWarningTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          AdditionalMentionTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });

      this.logger.debug(
        `Method: ${methodName} - Rresponse when delete true: `,
        additional
      );

      return additional;
    }

    const additional = await this.prisma.additional.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        AdditionalTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AdditionalWarningTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AdditionalMentionTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    this.logger.debug(
      `Method: ${methodName} - Rresponse when delete false: `,
      additional
    );

    return additional;
  }

  async restore(data: GetOneDto): Promise<AdditionalInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const additional = this.prisma.additional.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        AdditionalTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AdditionalWarningTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AdditionalMentionTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AdditionalContent: {
          include: {
            AdditionalContentContentTranslations: true,
            AdditionalContentNameTranslations: true,
          },
        },
        AdditionalTable: {
          include: {
            AdditionalTableContentTranslations: true,
            AdditionalTableNameTranslations: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Rresponse: `, additional);

    return additional;
  }
}
