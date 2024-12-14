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
  PassageCreateDto,
  PassageInterfaces,
  PassageUpdateDto,
} from 'types/organization/passage';
@Injectable()
export class PassageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService
  ) {}

  async create(data: PassageCreateDto): Promise<PassageInterfaces.Response> {
    const region = await this.regionService.findOne({
      id: data.regionId,
    });
    const city = await this.cityService.findOne({
      id: data.cityId,
    });
    const district = await this.districtService.findOne({
      id: data.districtId,
    });
    const passage = await this.prisma.passage.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        districtId: district.id,
        index: data.index,
        staffNumber: data.staffNumber,
        PassageTranslations: {
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
        PassageNewNameTranslations: {
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
        PassageOldNameTranslations: {
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
        PassageTranslations: true,
        PassageNewNameTranslations: true,
        PassageOldNameTranslations: true,
      },
    });
    return passage;
  }

  async findAll(
    data: ListQueryDto
  ): Promise<PassageInterfaces.ResponseWithPagination> {
    if (data.all) {
      const passages = await this.prisma.passage.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
        },
        include: {
          PassageTranslations: {
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
          PassageOldNameTranslations: {
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
          PassageNewNameTranslations: {
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

      const formattedPassage = [];

      for (let i = 0; i < passages.length; i++) {
        const passageData = passages[i];
        const translations = passageData.PassageTranslations;
        const name = formatLanguageResponse(translations);
        const translationsNew = passageData.PassageNewNameTranslations;
        const nameNew = formatLanguageResponse(translationsNew);
        const translationsOld = passageData.PassageOldNameTranslations;
        const nameOld = formatLanguageResponse(translationsOld);
        delete passageData.PassageTranslations;
        delete passageData.PassageNewNameTranslations;
        delete passageData.PassageOldNameTranslations;

        formattedPassage.push({
          ...passageData,
          name,
          newName: nameNew,
          oldName: nameOld,
        });
      }

      return {
        data: formattedPassage,
        totalDocs: passages.length,
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
      where.PassageTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
          },
        },
      };
    }
    const count = await this.prisma.passage.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const passages = await this.prisma.passage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        PassageTranslations: {
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
        PassageNewNameTranslations: {
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
        PassageOldNameTranslations: {
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

    const formattedPassage = [];

    for (let i = 0; i < passages.length; i++) {
      const passageData = passages[i];
      const translations = passageData.PassageTranslations;
      const name = formatLanguageResponse(translations);
      const translationsNew = passageData.PassageNewNameTranslations;
      const nameNew = formatLanguageResponse(translationsNew);
      const translationsOld = passageData.PassageOldNameTranslations;
      const nameOld = formatLanguageResponse(translationsOld);

      delete passageData.PassageTranslations;
      delete passageData.PassageNewNameTranslations;
      delete passageData.PassageOldNameTranslations;

      formattedPassage.push({
        ...passageData,
        name,
        newName: nameNew,
        oldName: nameOld,
      });
    }

    return {
      data: formattedPassage,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<PassageInterfaces.Response> {
    const passage = await this.prisma.passage.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        PassageTranslations: {
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
        PassageNewNameTranslations: {
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
        PassageOldNameTranslations: {
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
    if (!passage) {
      throw new NotFoundException('Passage is not found');
    }
    const name = formatLanguageResponse(passage.PassageTranslations);
    const nameNew = formatLanguageResponse(passage.PassageNewNameTranslations);
    const nameOld = formatLanguageResponse(passage.PassageOldNameTranslations);
    return { ...passage, name, newName: nameNew, oldName: nameOld };
  }

  async update(data: PassageUpdateDto): Promise<PassageInterfaces.Response> {
    const passage = await this.findOne({ id: data.id });

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

    return await this.prisma.passage.update({
      where: {
        id: passage.id,
      },
      data: {
        regionId: data.regionId || passage.regionId,
        cityId: data.cityId || passage.cityId,
        districtId: data.districtId || passage.districtId,
        staffNumber: data.staffNumber || passage.staffNumber,
        PassageTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
        PassageNewNameTranslations: {
          updateMany:
            translationNewNameUpdates.length > 0
              ? translationNewNameUpdates
              : undefined,
        },
        PassageOldNameTranslations: {
          updateMany:
            translationOldNameUpdates.length > 0
              ? translationOldNameUpdates
              : undefined,
        },
      },
      include: {
        PassageTranslations: true,
        PassageNewNameTranslations: true,
        PassageOldNameTranslations: true,
      },
    });
  }

  async remove(data: DeleteDto): Promise<PassageInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.passage.delete({
        where: { id: data.id },
        include: {
          PassageTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          PassageNewNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          PassageOldNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
    }

    return await this.prisma.passage.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        PassageTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        PassageNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        PassageOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }

  async restore(data: GetOneDto): Promise<PassageInterfaces.Response> {
    return this.prisma.passage.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        PassageTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        PassageNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        PassageOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }
}
