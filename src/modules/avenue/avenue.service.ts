import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  LanguageRequestEnum,
  ListQueryDto,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { createPagination } from '@/common/helper/pagination.helper';
import { RegionService } from '../region/region.service';
import { CityService } from '../city/city.service';
import { DistrictService } from '../district/district.service';
import {
  AvenueCreateDto,
  AvenueInterfaces,
  AvenueUpdateDto,
} from 'types/organization/avenue';
@Injectable()
export class AvenueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService
  ) {}

  async create(data: AvenueCreateDto): Promise<AvenueInterfaces.Response> {
    const region = await this.regionService.findOne({
      id: data.regionId,
    });
    const city = await this.cityService.findOne({
      id: data.cityId,
    });
    const district = await this.districtService.findOne({
      id: data.districtId,
    });
    const avenue = await this.prisma.avenue.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        districtId: district.id,
        index: data.index,
        staffNumber: data.staffNumber,
        AvenueTranslations: {
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
        AvenueNewNameTranslations: {
          create: [
            {
              languageCode: LanguageRequestEnum.RU,
              name: data.newName[LanguageRequestEnum.RU],
            },
            {
              languageCode: LanguageRequestEnum.UZ,
              name: data.newName[LanguageRequestEnum.UZ],
            },
            {
              languageCode: LanguageRequestEnum.CY,
              name: data.newName[LanguageRequestEnum.CY],
            },
          ],
        },
        AvenueOldNameTranslations: {
          create: [
            {
              languageCode: LanguageRequestEnum.RU,
              name: data.oldName[LanguageRequestEnum.RU],
            },
            {
              languageCode: LanguageRequestEnum.UZ,
              name: data.oldName[LanguageRequestEnum.UZ],
            },
            {
              languageCode: LanguageRequestEnum.CY,
              name: data.oldName[LanguageRequestEnum.CY],
            },
          ],
        },
      },
      include: {
        AvenueTranslations: true,
        AvenueNewNameTranslations: true,
        AvenueOldNameTranslations: true,
      },
    });
    return avenue;
  }

  async findAll(
    data: ListQueryDto
  ): Promise<AvenueInterfaces.ResponseWithPagination> {
    if (data.all) {
      const avenues = await this.prisma.avenue.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
        },
        include: {
          AvenueTranslations: {
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
          AvenueOldNameTranslations: {
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
          AvenueNewNameTranslations: {
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

      const formattedAvenue = [];

      for (let i = 0; i < avenues.length; i++) {
        const avenueData = avenues[i];
        const translations = avenueData.AvenueTranslations;
        const name = formatLanguageResponse(translations);
        const translationsNew = avenueData.AvenueNewNameTranslations;
        const nameNew = formatLanguageResponse(translationsNew);
        const translationsOld = avenueData.AvenueOldNameTranslations;
        const nameOld = formatLanguageResponse(translationsOld);
        delete avenueData.AvenueTranslations;
        delete avenueData.AvenueNewNameTranslations;
        delete avenueData.AvenueOldNameTranslations;

        formattedAvenue.push({
          ...avenueData,
          name,
          newName: nameNew,
          oldName: nameOld,
        });
      }

      return {
        data: formattedAvenue,
        totalDocs: avenues.length,
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
      where.AvenueTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
          },
        },
      };
    }
    const count = await this.prisma.avenue.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const avenues = await this.prisma.avenue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        AvenueTranslations: {
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
        AvenueNewNameTranslations: {
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
        AvenueOldNameTranslations: {
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

    const formattedAvenue = [];

    for (let i = 0; i < avenues.length; i++) {
      const avenueData = avenues[i];
      const translations = avenueData.AvenueTranslations;
      const name = formatLanguageResponse(translations);
      const translationsNew = avenueData.AvenueNewNameTranslations;
      const nameNew = formatLanguageResponse(translationsNew);
      const translationsOld = avenueData.AvenueOldNameTranslations;
      const nameOld = formatLanguageResponse(translationsOld);

      delete avenueData.AvenueTranslations;
      delete avenueData.AvenueNewNameTranslations;
      delete avenueData.AvenueOldNameTranslations;

      formattedAvenue.push({
        ...avenueData,
        name,
        newName: nameNew,
        oldName: nameOld,
      });
    }

    return {
      data: formattedAvenue,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<AvenueInterfaces.Response> {
    const avenue = await this.prisma.avenue.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        AvenueTranslations: {
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
        AvenueNewNameTranslations: {
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
        AvenueOldNameTranslations: {
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
    if (!avenue) {
      throw new NotFoundException('Avenue is not found');
    }
    const name = formatLanguageResponse(avenue.AvenueTranslations);
    const nameNew = formatLanguageResponse(avenue.AvenueNewNameTranslations);
    const nameOld = formatLanguageResponse(avenue.AvenueOldNameTranslations);
    return { ...avenue, name, newName: nameNew, oldName: nameOld };
  }

  async update(data: AvenueUpdateDto): Promise<AvenueInterfaces.Response> {
    const avenue = await this.findOne({ id: data.id });

    if (data.regionId) {
      await this.regionService.findOne({ id: data.regionId });
    }

    if (data.cityId) {
      await this.cityService.findOne({ id: data.cityId });
    }

    if (data.districtId) {
      await this.districtService.findOne({ id: data.districtId });
    }

    const translationUpdates = [];
    const translationNewNameUpdates = [];
    const translationOldNameUpdates = [];

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
    if (data.newName?.[LanguageRequestEnum.RU]) {
      translationNewNameUpdates.push({
        where: { languageCode: LanguageRequestEnum.RU },
        data: { name: data.newName[LanguageRequestEnum.RU] },
      });
    }

    if (data.newName?.[LanguageRequestEnum.UZ]) {
      translationNewNameUpdates.push({
        where: { languageCode: LanguageRequestEnum.UZ },
        data: { name: data.newName[LanguageRequestEnum.UZ] },
      });
    }

    if (data.newName?.[LanguageRequestEnum.CY]) {
      translationNewNameUpdates.push({
        where: { languageCode: LanguageRequestEnum.CY },
        data: { name: data.newName[LanguageRequestEnum.CY] },
      });
    }

    if (data.oldName?.[LanguageRequestEnum.RU]) {
      translationOldNameUpdates.push({
        where: { languageCode: LanguageRequestEnum.RU },
        data: { name: data.oldName[LanguageRequestEnum.RU] },
      });
    }

    if (data.oldName?.[LanguageRequestEnum.UZ]) {
      translationOldNameUpdates.push({
        where: { languageCode: LanguageRequestEnum.UZ },
        data: { name: data.oldName[LanguageRequestEnum.UZ] },
      });
    }

    if (data.oldName?.[LanguageRequestEnum.CY]) {
      translationOldNameUpdates.push({
        where: { languageCode: LanguageRequestEnum.CY },
        data: { name: data.oldName[LanguageRequestEnum.CY] },
      });
    }

    return await this.prisma.avenue.update({
      where: {
        id: avenue.id,
      },
      data: {
        regionId: data.regionId || avenue.regionId,
        cityId: data.cityId || avenue.cityId,
        districtId: data.districtId || avenue.districtId,
        staffNumber: data.staffNumber || avenue.staffNumber,
        AvenueTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
        AvenueNewNameTranslations: {
          updateMany:
            translationNewNameUpdates.length > 0
              ? translationNewNameUpdates
              : undefined,
        },
        AvenueOldNameTranslations: {
          updateMany:
            translationOldNameUpdates.length > 0
              ? translationOldNameUpdates
              : undefined,
        },
      },
      include: {
        AvenueTranslations: true,
        AvenueNewNameTranslations: true,
        AvenueOldNameTranslations: true,
      },
    });
  }

  async remove(data: DeleteDto): Promise<AvenueInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.avenue.delete({
        where: { id: data.id },
        include: {
          AvenueTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          AvenueNewNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          AvenueOldNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
    }

    return await this.prisma.avenue.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        AvenueTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AvenueNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AvenueOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }

  async restore(data: GetOneDto): Promise<AvenueInterfaces.Response> {
    return this.prisma.avenue.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        AvenueTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AvenueNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AvenueOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }
}
