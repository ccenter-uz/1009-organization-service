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
  ResidentialAreaCreateDto,
  ResidentialAreaInterfaces,
  ResidentialAreaUpdateDto,
} from 'types/organization/residential-area';
@Injectable()
export class ResidentialAreaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService
  ) {}

  async create(
    data: ResidentialAreaCreateDto
  ): Promise<ResidentialAreaInterfaces.Response> {
    const region = await this.regionService.findOne({
      id: data.regionId,
    });
    const city = await this.cityService.findOne({
      id: data.cityId,
    });
    const district = await this.districtService.findOne({
      id: data.districtId,
    });
    const residentialArea = await this.prisma.residentialArea.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        districtId: district.id,
        index: data.index,
        staffNumber: data.staffNumber,
        ResidentialAreaTranslations: {
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
        ResidentialAreaNewNameTranslations: {
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
        ResidentialAreaOldNameTranslations: {
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
        ResidentialAreaTranslations: true,
        ResidentialAreaNewNameTranslations: true,
        ResidentialAreaOldNameTranslations: true,
      },
    });
    return residentialArea;
  }

  async findAll(
    data: ListQueryDto
  ): Promise<ResidentialAreaInterfaces.ResponseWithPagination> {
    if (data.all) {
      const residentialAreas = await this.prisma.residentialArea.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
        },
        include: {
          ResidentialAreaTranslations: {
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
          ResidentialAreaOldNameTranslations: {
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
          ResidentialAreaNewNameTranslations: {
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

      const formattedResidentialArea = [];

      for (let i = 0; i < residentialAreas.length; i++) {
        const residentialAreaData = residentialAreas[i];
        const translations = residentialAreaData.ResidentialAreaTranslations;
        const name = formatLanguageResponse(translations);
        const translationsNew =
          residentialAreaData.ResidentialAreaNewNameTranslations;
        const nameNew = formatLanguageResponse(translationsNew);
        const translationsOld =
          residentialAreaData.ResidentialAreaOldNameTranslations;
        const nameOld = formatLanguageResponse(translationsOld);
        delete residentialAreaData.ResidentialAreaTranslations;
        delete residentialAreaData.ResidentialAreaNewNameTranslations;
        delete residentialAreaData.ResidentialAreaOldNameTranslations;

        formattedResidentialArea.push({
          ...residentialAreaData,
          name,
          newName: nameNew,
          oldName: nameOld,
        });
      }

      return {
        data: formattedResidentialArea,
        totalDocs: residentialAreas.length,
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
      where.ResidentialAreaTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
          },
        },
      };
    }
    const count = await this.prisma.residentialArea.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const residentialAreas = await this.prisma.residentialArea.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        ResidentialAreaTranslations: {
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
        ResidentialAreaNewNameTranslations: {
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
        ResidentialAreaOldNameTranslations: {
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

    const formattedResidentialArea = [];

    for (let i = 0; i < residentialAreas.length; i++) {
      const residentialAreaData = residentialAreas[i];
      const translations = residentialAreaData.ResidentialAreaTranslations;
      const name = formatLanguageResponse(translations);
      const translationsNew =
        residentialAreaData.ResidentialAreaNewNameTranslations;
      const nameNew = formatLanguageResponse(translationsNew);
      const translationsOld =
        residentialAreaData.ResidentialAreaOldNameTranslations;
      const nameOld = formatLanguageResponse(translationsOld);

      delete residentialAreaData.ResidentialAreaTranslations;
      delete residentialAreaData.ResidentialAreaNewNameTranslations;
      delete residentialAreaData.ResidentialAreaOldNameTranslations;

      formattedResidentialArea.push({
        ...residentialAreaData,
        name,
        newName: nameNew,
        oldName: nameOld,
      });
    }

    return {
      data: formattedResidentialArea,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<ResidentialAreaInterfaces.Response> {
    const residentialArea = await this.prisma.residentialArea.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        ResidentialAreaTranslations: {
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
        ResidentialAreaNewNameTranslations: {
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
        ResidentialAreaOldNameTranslations: {
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
    if (!residentialArea) {
      throw new NotFoundException('ResidentialArea is not found');
    }
    const name = formatLanguageResponse(
      residentialArea.ResidentialAreaTranslations
    );
    const nameNew = formatLanguageResponse(
      residentialArea.ResidentialAreaNewNameTranslations
    );
    const nameOld = formatLanguageResponse(
      residentialArea.ResidentialAreaOldNameTranslations
    );
    return { ...residentialArea, name, newName: nameNew, oldName: nameOld };
  }

  async update(
    data: ResidentialAreaUpdateDto
  ): Promise<ResidentialAreaInterfaces.Response> {
    const residentialArea = await this.findOne({ id: data.id });

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

    return await this.prisma.residentialArea.update({
      where: {
        id: residentialArea.id,
      },
      data: {
        regionId: data.regionId || residentialArea.regionId,
        cityId: data.cityId || residentialArea.cityId,
        districtId: data.districtId || residentialArea.districtId,
        staffNumber: data.staffNumber || residentialArea.staffNumber,
        ResidentialAreaTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
        ResidentialAreaNewNameTranslations: {
          updateMany:
            translationNewNameUpdates.length > 0
              ? translationNewNameUpdates
              : undefined,
        },
        ResidentialAreaOldNameTranslations: {
          updateMany:
            translationOldNameUpdates.length > 0
              ? translationOldNameUpdates
              : undefined,
        },
      },
      include: {
        ResidentialAreaTranslations: true,
        ResidentialAreaNewNameTranslations: true,
        ResidentialAreaOldNameTranslations: true,
      },
    });
  }

  async remove(data: DeleteDto): Promise<ResidentialAreaInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.residentialArea.delete({
        where: { id: data.id },
        include: {
          ResidentialAreaTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          ResidentialAreaNewNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          ResidentialAreaOldNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
    }

    return await this.prisma.residentialArea.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        ResidentialAreaTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        ResidentialAreaNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        ResidentialAreaOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }

  async restore(data: GetOneDto): Promise<ResidentialAreaInterfaces.Response> {
    return this.prisma.residentialArea.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        ResidentialAreaTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        ResidentialAreaNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        ResidentialAreaOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }
}
