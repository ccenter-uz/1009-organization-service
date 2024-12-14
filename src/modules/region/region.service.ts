import { Injectable, NotFoundException } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  RegionCreateDto,
  RegionInterfaces,
  RegionUpdateDto,
} from 'types/organization/region';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  LanguageRequestEnum,
  ListQueryDto,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';

@Injectable()
export class RegionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: RegionCreateDto): Promise<RegionInterfaces.Response> {
    const region = await this.prisma.region.create({
      data: {
        RegionTranslations: {
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
        RegionTranslations: true,
      },
    });
    return region;
  }

  async findAll(
    data: ListQueryDto
  ): Promise<RegionInterfaces.ResponseWithPagination> {
    if (data.all) {
      const regions = await this.prisma.region.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
        },
        include: {
          RegionTranslations: {
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

      for (let i = 0; i < regions.length; i++) {
        const region = regions[i];
        const translations = region.RegionTranslations;
        const name = formatLanguageResponse(translations);

        delete region.RegionTranslations;

        formattedCategories.push({ ...region, name });
      }

      return {
        data: formattedCategories,
        totalDocs: regions.length,
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
      where.RegionTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
          },
        },
      };
    }
    const count = await this.prisma.region.count({ where });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const regions = await this.prisma.region.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        RegionTranslations: {
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
      },
      take: pagination.take,
      skip: pagination.skip,
    });

    const formattedCategories = [];

    for (let i = 0; i < regions.length; i++) {
      const region = regions[i];
      const translations = region.RegionTranslations;
      const name = formatLanguageResponse(translations);

      delete region.RegionTranslations;

      formattedCategories.push({ ...region, name });
    }

    return {
      data: formattedCategories,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<RegionInterfaces.Response> {
    const region = await this.prisma.region.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        RegionTranslations: {
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
    if (!region) {
      throw new NotFoundException('Region is not found');
    }
    const name = formatLanguageResponse(region.RegionTranslations);
    return { ...region, name };
  }

  async update(data: RegionUpdateDto): Promise<RegionInterfaces.Response> {
    const region = await this.findOne({ id: data.id });

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

    return await this.prisma.region.update({
      where: {
        id: region.id,
      },
      data: {
        RegionTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
      },
      include: {
        RegionTranslations: true,
      },
    });
  }

  async remove(data: DeleteDto): Promise<RegionInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.region.delete({
        where: { id: data.id },
        include: {
          RegionTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
    }

    return await this.prisma.region.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        RegionTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }

  async restore(data: GetOneDto): Promise<RegionInterfaces.Response> {
    return this.prisma.region.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        RegionTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }
}
