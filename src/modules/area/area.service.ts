import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestEnum,
  ListQueryDto,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { createPagination } from '@/common/helper/pagination.helper';
import { RegionService } from '../region/region.service';
import { CityService } from '../city/city.service';
import { DistrictService } from '../district/district.service';
import {
  AreaCreateDto,
  AreaInterfaces,
  AreaUpdateDto,
} from 'types/organization/area';
@Injectable()
export class AreaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService
  ) {}

  async create(data: AreaCreateDto): Promise<AreaInterfaces.Response> {
    const region = await this.regionService.findOne({
      id: data.regionId,
    });
    const city = await this.cityService.findOne({
      id: data.cityId,
    });
    let district;
    if (data.districtId) {
      district = await this.districtService.findOne({
        id: data.districtId,
      });
    }
    const area = await this.prisma.area.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        ...(data.districtId ? { districtId: district.id } : {}),
        index: data.index,
        staffNumber: data.staffNumber,
        AreaTranslations: {
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
        AreaNewNameTranslations: {
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
        AreaOldNameTranslations: {
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
        AreaTranslations: true,
        AreaNewNameTranslations: true,
        AreaOldNameTranslations: true,
      },
    });
    return area;
  }

  async findAll(
    data: ListQueryDto
  ): Promise<AreaInterfaces.ResponseWithPagination> {
    if (data.all) {
      const areas = await this.prisma.area.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
        },
        include: {
          AreaTranslations: {
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
          AreaOldNameTranslations: {
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
          AreaNewNameTranslations: {
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

          region: {
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
          },
          city: {
            include: {
              CityTranslations: {
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

      const formattedArea = [];

      for (let i = 0; i < areas.length; i++) {
        const areaData = areas[i];
        const translations = areaData.AreaTranslations;
        const name = formatLanguageResponse(translations);
        const translationsNew = areaData.AreaNewNameTranslations;
        const nameNew = formatLanguageResponse(translationsNew);
        const translationsOld = areaData.AreaOldNameTranslations;
        const nameOld = formatLanguageResponse(translationsOld);
        delete areaData.AreaTranslations;
        delete areaData.AreaNewNameTranslations;
        delete areaData.AreaOldNameTranslations;

        const regionTranslations = areaData.region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete areaData.region.RegionTranslations;
        const region = { ...areaData.region, name: regionName };
        delete areaData.region;

        const cityTranslations = areaData.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete areaData.city.CityTranslations;
        const city = { ...areaData.city, name: cityName };
        delete areaData.city;

        formattedArea.push({
          ...areaData,
          name,
          newName: nameNew,
          oldName: nameOld,
          region,
          city,
        });
      }

      return {
        data: formattedArea,
        totalDocs: areas.length,
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
      where.AreaTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
          },
        },
      };
    }
    const count = await this.prisma.area.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const areas = await this.prisma.area.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        AreaTranslations: {
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
        AreaNewNameTranslations: {
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
        AreaOldNameTranslations: {
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

        region: {
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
        },
        city: {
          include: {
            CityTranslations: {
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
      take: pagination.take,
      skip: pagination.skip,
    });

    const formattedArea = [];

    for (let i = 0; i < areas.length; i++) {
      const areaData = areas[i];
      const translations = areaData.AreaTranslations;
      const name = formatLanguageResponse(translations);
      const translationsNew = areaData.AreaNewNameTranslations;
      const nameNew = formatLanguageResponse(translationsNew);
      const translationsOld = areaData.AreaOldNameTranslations;
      const nameOld = formatLanguageResponse(translationsOld);

      delete areaData.AreaTranslations;
      delete areaData.AreaNewNameTranslations;
      delete areaData.AreaOldNameTranslations;

      const regionTranslations = areaData.region.RegionTranslations;
      const regionName = formatLanguageResponse(regionTranslations);
      delete areaData.region.RegionTranslations;
      const region = { ...areaData.region, name: regionName };
      delete areaData.region;

      const cityTranslations = areaData.city.CityTranslations;
      const cityName = formatLanguageResponse(cityTranslations);
      delete areaData.city.CityTranslations;
      const city = { ...areaData.city, name: cityName };
      delete areaData.city;

      formattedArea.push({
        ...areaData,
        name,
        newName: nameNew,
        oldName: nameOld,
        region,
        city,
      });
    }

    return {
      data: formattedArea,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<AreaInterfaces.Response> {
    const area = await this.prisma.area.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        AreaTranslations: {
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
        AreaNewNameTranslations: {
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
        AreaOldNameTranslations: {
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
        region: {
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
        },
        city: {
          include: {
            CityTranslations: {
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
    if (!area) {
      throw new NotFoundException('Area is not found');
    }
    const name = formatLanguageResponse(area.AreaTranslations);
    const nameNew = formatLanguageResponse(area.AreaNewNameTranslations);
    const nameOld = formatLanguageResponse(area.AreaOldNameTranslations);
    delete area.AreaNewNameTranslations;
    delete area.AreaOldNameTranslations;
    delete area.AreaTranslations;

    const regionTranslations = area.region.RegionTranslations;
    const regionName = formatLanguageResponse(regionTranslations);
    delete area.region.RegionTranslations;
    const region = { ...area.region, name: regionName };
    delete area.region;

    const cityTranslations = area.city.CityTranslations;
    const cityName = formatLanguageResponse(cityTranslations);
    delete area.city.CityTranslations;
    const city = { ...area.city, name: cityName };
    delete area.city;

    return { ...area, name, newName: nameNew, oldName: nameOld, region, city };
  }

  async update(data: AreaUpdateDto): Promise<AreaInterfaces.Response> {
    const area = await this.findOne({ id: data.id });

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

    return await this.prisma.area.update({
      where: {
        id: area.id,
      },
      data: {
        regionId: data.regionId || area.regionId,
        cityId: data.cityId || area.cityId,
        districtId: data.districtId || area.districtId,
        staffNumber: data.staffNumber || area.staffNumber,
        index: data.index || area.index,
        AreaTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
        AreaNewNameTranslations: {
          updateMany:
            translationNewNameUpdates.length > 0
              ? translationNewNameUpdates
              : undefined,
        },
        AreaOldNameTranslations: {
          updateMany:
            translationOldNameUpdates.length > 0
              ? translationOldNameUpdates
              : undefined,
        },
      },
      include: {
        AreaTranslations: true,
        AreaNewNameTranslations: true,
        AreaOldNameTranslations: true,
      },
    });
  }

  async remove(data: DeleteDto): Promise<AreaInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.area.delete({
        where: { id: data.id },
        include: {
          AreaTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          AreaNewNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          AreaOldNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
    }

    return await this.prisma.area.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        AreaTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AreaNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AreaOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }

  async restore(data: GetOneDto): Promise<AreaInterfaces.Response> {
    return this.prisma.area.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        AreaTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AreaNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AreaOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }
}
