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
        AdditionalWarningTranslations: {
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
        AdditionalMentionTranslations: {
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
        AdditionalTranslations: true,
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

    this.logger.debug(`Method: ${methodName} - Response: `, additional);

    return { ...additional, name, warning, mention };
  }

  async update(
    data: AdditionalUpdateDto
  ): Promise<AdditionalInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const additional = await this.findOne({ id: data.id });

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

    const warningUpdates = [];

    if (data.warning?.[LanguageRequestEnum.RU]) {
      warningUpdates.push({
        where: { languageCode: LanguageRequestEnum.RU },
        data: { name: data.warning[LanguageRequestEnum.RU] },
      });
    }

    if (data.warning?.[LanguageRequestEnum.UZ]) {
      warningUpdates.push({
        where: { languageCode: LanguageRequestEnum.UZ },
        data: { name: data.warning[LanguageRequestEnum.UZ] },
      });
    }

    if (data.warning?.[LanguageRequestEnum.CY]) {
      warningUpdates.push({
        where: { languageCode: LanguageRequestEnum.CY },
        data: { name: data.warning[LanguageRequestEnum.CY] },
      });
    }

    const mentionUpdates = [];

    if (data.mention?.[LanguageRequestEnum.RU]) {
      mentionUpdates.push({
        where: { languageCode: LanguageRequestEnum.RU },
        data: { name: data.mention[LanguageRequestEnum.RU] },
      });
    }

    if (data.mention?.[LanguageRequestEnum.UZ]) {
      mentionUpdates.push({
        where: { languageCode: LanguageRequestEnum.UZ },
        data: { name: data.mention[LanguageRequestEnum.UZ] },
      });
    }

    if (data.mention?.[LanguageRequestEnum.CY]) {
      mentionUpdates.push({
        where: { languageCode: LanguageRequestEnum.CY },
        data: { name: data.mention[LanguageRequestEnum.CY] },
      });
    }

    const updatedAdditional = await this.prisma.additional.update({
      where: {
        id: additional.id,
      },
      data: {
        staffNumber: data.staffNumber || additional.staffNumber,
        AdditionalTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
        AdditionalWarningTranslations: {
          updateMany: warningUpdates.length > 0 ? warningUpdates : undefined,
        },
        AdditionalMentionTranslations: {
          updateMany: mentionUpdates.length > 0 ? mentionUpdates : undefined,
        },
      },
      include: {
        AdditionalTranslations: true,
        AdditionalWarningTranslations: true,
        AdditionalMentionTranslations: true,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updatedAdditional);

    return updatedAdditional;
  }

  async remove(data: DeleteDto): Promise<AdditionalInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

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
      },
    });

    this.logger.debug(`Method: ${methodName} - Rresponse: `, additional);

    return additional;
  }
}
