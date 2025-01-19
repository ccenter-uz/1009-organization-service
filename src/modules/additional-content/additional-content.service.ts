import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  AdditionalContentCreateDto,
  AdditionalContentInterfaces,
  AdditionalContentUpdateDto,
} from 'types/organization/additional-content';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestEnum,
  StatusEnum,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { AdditionalContentFilterDto } from 'types/organization/additional-content/dto/filter-additional-content.dto';
import { AdditionalService } from '../additional/additional.service';

@Injectable()
export class AdditionalContentService {
  private logger = new Logger(AdditionalContentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly additionalService: AdditionalService
  ) {}

  async create(
    data: AdditionalContentCreateDto
  ): Promise<AdditionalContentInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const additional = await this.additionalService.findOne({
      id: data.additionalId,
    });
    const additionalContent = await this.prisma.additionalContent.create({
      data: {
        additionalId: additional.id,
        status: StatusEnum.ACTIVE,
        AdditionalContentContentTranslations: {
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
        AdditionalContentNameTranslations: {
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
        AdditionalContentContentTranslations: true,
        AdditionalContentNameTranslations: true,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, data);

    return additionalContent;
  }

  async findAll(
    data: AdditionalContentFilterDto
  ): Promise<AdditionalContentInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    if (data.all) {
      const additionalContents = await this.prisma.additionalContent.findMany({
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
      });

      const formattedCategories = [];

      for (let i = 0; i < additionalContents.length; i++) {
        const additionalContent = additionalContents[i];
        // content
        const content = formatLanguageResponse(
          additionalContent.AdditionalContentContentTranslations
        );
        delete additionalContent.AdditionalContentContentTranslations;

        // name
        const name = formatLanguageResponse(
          additionalContent.AdditionalContentNameTranslations
        );
        delete additionalContent.AdditionalContentNameTranslations;

        formattedCategories.push({ ...additionalContent, content, name });
      }

      this.logger.debug(
        `Method: ${methodName} -  Response: `,
        formattedCategories
      );

      return {
        data: formattedCategories,
        totalDocs: additionalContents.length,
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
      where.AdditionalContentContentTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
            mode: 'insensitive',
          },
        },
      };
    }
    const count = await this.prisma.additionalContent.count({ where });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const additionalContents = await this.prisma.additionalContent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        AdditionalContentContentTranslations: {
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
      take: pagination.take,
      skip: pagination.skip,
    });

    const formattedCategories = [];

    for (let i = 0; i < additionalContents.length; i++) {
      const additionalContent = additionalContents[i];
      // content
      const content = formatLanguageResponse(
        additionalContent.AdditionalContentContentTranslations
      );
      delete additionalContent.AdditionalContentContentTranslations;

      // name
      const name = formatLanguageResponse(
        additionalContent.AdditionalContentNameTranslations
      );
      delete additionalContent.AdditionalContentNameTranslations;

      formattedCategories.push({ ...additionalContent, content, name });
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
  ): Promise<AdditionalContentInterfaces.Response> {
    const methodName: string = this.findOne.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const additionalContent = await this.prisma.additionalContent.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
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
    });

    if (!additionalContent) {
      throw new NotFoundException('AdditionalContent is not found');
    }

    const content = formatLanguageResponse(
      additionalContent.AdditionalContentContentTranslations
    );

    delete additionalContent.AdditionalContentContentTranslations;

    const name = formatLanguageResponse(
      additionalContent.AdditionalContentNameTranslations
    );

    delete additionalContent.AdditionalContentNameTranslations;

    this.logger.debug(`Method: ${methodName} - Response: `, additionalContent);
    return { ...additionalContent, content, name };
  }

  async update(
    data: AdditionalContentUpdateDto
  ): Promise<AdditionalContentInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const additionalContent = await this.findOne({ id: data.id });

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

    const updatedAdditionalContent = await this.prisma.additionalContent.update(
      {
        where: {
          id: additionalContent.id,
        },
        data: {
          AdditionalContentNameTranslations: {
            updateMany: nameUpdates.length > 0 ? nameUpdates : undefined,
          },
          AdditionalContentContentTranslations: {
            updateMany: contentUpdates.length > 0 ? contentUpdates : undefined,
          },
        },
        include: {
          AdditionalContentContentTranslations: true,
          AdditionalContentNameTranslations: true,
        },
      }
    );

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedAdditionalContent
    );

    return updatedAdditionalContent;
  }

  async remove(data: DeleteDto): Promise<AdditionalContentInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    if (data.delete) {
      const additionalContent = await this.prisma.additionalContent.delete({
        where: { id: data.id },
        include: {
          AdditionalContentContentTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          AdditionalContentNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });

      this.logger.debug(
        `Method: ${methodName} - Rresponse when delete true: `,
        additionalContent
      );

      return additionalContent;
    }

    const additionalContent = await this.prisma.additionalContent.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        AdditionalContentContentTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AdditionalContentNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    this.logger.debug(
      `Method: ${methodName} - Rresponse when delete false: `,
      additionalContent
    );

    return additionalContent;
  }

  async restore(
    data: GetOneDto
  ): Promise<AdditionalContentInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const additionalContent = this.prisma.additionalContent.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        AdditionalContentContentTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AdditionalContentNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Rresponse: `, additionalContent);

    return additionalContent;
  }
}
