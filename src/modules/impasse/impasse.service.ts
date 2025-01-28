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
  ImpasseCreateDto,
  ImpasseInterfaces,
  ImpasseUpdateDto,
} from 'types/organization/impasse';
import { CityRegionFilterDto } from 'types/global-filters/city-region-filter';
@Injectable()
export class ImpasseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService
  ) {}

  async create(data: ImpasseCreateDto): Promise<ImpasseInterfaces.Response> {
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
    const names: any = {};

    if (data.newName) {
      names.ImpasseNewNameTranslations = {
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
      };
    }

    if (data.oldName) {
      names.ImpasseOldNameTranslations = {
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
      };
    }
    const impasse = await this.prisma.impasse.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        ...(data.districtId ? { districtId: district.id } : {}),
        index: data.index,
        staffNumber: data.staffNumber,
        orderNumber: data.orderNumber,
        ImpasseTranslations: {
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
        ...names,
      },
      include: {
        ImpasseTranslations: true,
        ImpasseNewNameTranslations: true,
        ImpasseOldNameTranslations: true,
      },
    });
    return impasse;
  }

  async findAll(
    data: CityRegionFilterDto
  ): Promise<ImpasseInterfaces.ResponseWithPagination> {
    if (data.all) {
      const impasses = await this.prisma.impasse.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
          cityId: data.cityId,
          regionId: data.regionId,
        },
        include: {
          ImpasseTranslations: {
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
          ImpasseOldNameTranslations: {
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
          ImpasseNewNameTranslations: {
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
          district: {
            include: {
              DistrictTranslations: {
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
              DistrictNewNameTranslations: {
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
              DistrictOldNameTranslations: {
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

      const formattedImpasse = [];

      for (let i = 0; i < impasses.length; i++) {
        const impasseData = impasses[i];
        const translations = impasseData.ImpasseTranslations;
        const name = formatLanguageResponse(translations);
        const translationsNew = impasseData.ImpasseNewNameTranslations;
        const nameNew = formatLanguageResponse(translationsNew);
        const translationsOld = impasseData.ImpasseOldNameTranslations;
        const nameOld = formatLanguageResponse(translationsOld);
        delete impasseData.ImpasseTranslations;
        delete impasseData.ImpasseNewNameTranslations;
        delete impasseData.ImpasseOldNameTranslations;

        const regionTranslations = impasseData.region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete impasseData.region.RegionTranslations;
        const region = { ...impasseData.region, name: regionName };
        delete impasseData.region;

        const cityTranslations = impasseData.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete impasseData.city.CityTranslations;
        const city = { ...impasseData.city, name: cityName };
        delete impasseData.city;

        const districtData = impasseData?.district;
        let districtName: string | object;
        let districtNameNew: string | object;
        let districtNameOld: string | object;

        if (districtData) {
          const districtTranslations = districtData.DistrictTranslations;
          districtName = formatLanguageResponse(districtTranslations);
          const districtTranslationsNew =
            districtData.DistrictNewNameTranslations;
          districtNameNew = formatLanguageResponse(districtTranslationsNew);
          const districtTranslationsOld =
            districtData.DistrictOldNameTranslations;
          districtNameOld = formatLanguageResponse(districtTranslationsOld);
          delete districtData.DistrictTranslations;
          delete districtData.DistrictNewNameTranslations;
          delete districtData.DistrictOldNameTranslations;
        }

        const district = {
          ...impasseData.district,
          name: districtName,
          districtNameNew,
          districtNameOld,
        };
        delete impasseData.district;

        formattedImpasse.push({
          ...impasseData,
          name,
          newName: nameNew,
          oldName: nameOld,
          region,
          city,
          district,
        });
      }

      return {
        data: formattedImpasse,
        totalDocs: impasses.length,
        totalPage: 1,
      };
    }

    const where: any = {
      ...(data.status == 2
        ? {}
        : {
            status: data.status,
          }),
      cityId: data.cityId,
      regionId: data.regionId,
    };
    if (data.search) {
      where.ImpasseTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
            mode: 'insensitive',
          },
        },
      };
    }
    const count = await this.prisma.impasse.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const impasses = await this.prisma.impasse.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        ImpasseTranslations: {
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
        ImpasseNewNameTranslations: {
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
        ImpasseOldNameTranslations: {
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
        district: {
          include: {
            DistrictTranslations: {
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
            DistrictNewNameTranslations: {
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
            DistrictOldNameTranslations: {
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

    const formattedImpasse = [];

    for (let i = 0; i < impasses.length; i++) {
      const impasseData = impasses[i];
      const translations = impasseData.ImpasseTranslations;
      const name = formatLanguageResponse(translations);
      const translationsNew = impasseData.ImpasseNewNameTranslations;
      const nameNew = formatLanguageResponse(translationsNew);
      const translationsOld = impasseData.ImpasseOldNameTranslations;
      const nameOld = formatLanguageResponse(translationsOld);

      delete impasseData.ImpasseTranslations;
      delete impasseData.ImpasseNewNameTranslations;
      delete impasseData.ImpasseOldNameTranslations;

      const regionTranslations = impasseData.region.RegionTranslations;
      const regionName = formatLanguageResponse(regionTranslations);
      delete impasseData.region.RegionTranslations;
      const region = { ...impasseData.region, name: regionName };
      delete impasseData.region;

      const cityTranslations = impasseData.city.CityTranslations;
      const cityName = formatLanguageResponse(cityTranslations);
      delete impasseData.city.CityTranslations;
      const city = { ...impasseData.city, name: cityName };
      delete impasseData.city;

      const districtData = impasseData?.district;
      let districtName: string | object;
      let districtNameNew: string | object;
      let districtNameOld: string | object;

      if (districtData) {
        const districtTranslations = districtData.DistrictTranslations;
        districtName = formatLanguageResponse(districtTranslations);
        const districtTranslationsNew =
          districtData.DistrictNewNameTranslations;
        districtNameNew = formatLanguageResponse(districtTranslationsNew);
        const districtTranslationsOld =
          districtData.DistrictOldNameTranslations;
        districtNameOld = formatLanguageResponse(districtTranslationsOld);
        delete districtData.DistrictTranslations;
        delete districtData.DistrictNewNameTranslations;
        delete districtData.DistrictOldNameTranslations;
      }

      const district = {
        ...impasseData.district,
        name: districtName,
        districtNameNew,
        districtNameOld,
      };
      delete impasseData.district;

      formattedImpasse.push({
        ...impasseData,
        name,
        newName: nameNew,
        oldName: nameOld,
        region,
        city,
        district,
      });
    }

    return {
      data: formattedImpasse,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<ImpasseInterfaces.Response> {
    const impasse = await this.prisma.impasse.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        ImpasseTranslations: {
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
        ImpasseNewNameTranslations: {
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
        ImpasseOldNameTranslations: {
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
        district: {
          include: {
            DistrictTranslations: {
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
            DistrictNewNameTranslations: {
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
            DistrictOldNameTranslations: {
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
    if (!impasse) {
      throw new NotFoundException('Impasse is not found');
    }
    const name = formatLanguageResponse(impasse.ImpasseTranslations);
    const nameNew = formatLanguageResponse(impasse.ImpasseNewNameTranslations);
    const nameOld = formatLanguageResponse(impasse.ImpasseOldNameTranslations);
    delete impasse.ImpasseNewNameTranslations;
    delete impasse.ImpasseOldNameTranslations;
    delete impasse.ImpasseTranslations;

    const regionTranslations = impasse.region.RegionTranslations;
    const regionName = formatLanguageResponse(regionTranslations);
    delete impasse.region.RegionTranslations;
    const region = { ...impasse.region, name: regionName };
    delete impasse.region;

    const cityTranslations = impasse.city.CityTranslations;
    const cityName = formatLanguageResponse(cityTranslations);
    delete impasse.city.CityTranslations;
    const city = { ...impasse.city, name: cityName };
    delete impasse.city;

    const districtData = impasse?.district;
    let districtName: string | object;
    let districtNameNew: string | object;
    let districtNameOld: string | object;

    if (districtData) {
      const districtTranslations = districtData.DistrictTranslations;
      districtName = formatLanguageResponse(districtTranslations);
      const districtTranslationsNew = districtData.DistrictNewNameTranslations;
      districtNameNew = formatLanguageResponse(districtTranslationsNew);
      const districtTranslationsOld = districtData.DistrictOldNameTranslations;
      districtNameOld = formatLanguageResponse(districtTranslationsOld);
      delete districtData.DistrictTranslations;
      delete districtData.DistrictNewNameTranslations;
      delete districtData.DistrictOldNameTranslations;
    }

    const district = {
      ...impasse.district,
      name: districtName,
      districtNameNew,
      districtNameOld,
    };
    delete impasse.district;

    return {
      ...impasse,
      name,
      newName: nameNew,
      oldName: nameOld,
      region,
      city,
      district,
    };
  }

  async update(data: ImpasseUpdateDto): Promise<ImpasseInterfaces.Response> {
    const impasse = await this.findOne({ id: data.id });

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

    return await this.prisma.impasse.update({
      where: {
        id: impasse.id,
      },
      data: {
        regionId: data.regionId || impasse.regionId,
        cityId: data.cityId || impasse.cityId,
        districtId: data.districtId || null,
        staffNumber: data.staffNumber || impasse.staffNumber,
        index: data.index || impasse.index,
        orderNumber: data.orderNumber,
        ImpasseTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
        ImpasseNewNameTranslations: {
          updateMany:
            translationNewNameUpdates.length > 0
              ? translationNewNameUpdates
              : undefined,
        },
        ImpasseOldNameTranslations: {
          updateMany:
            translationOldNameUpdates.length > 0
              ? translationOldNameUpdates
              : undefined,
        },
      },
      include: {
        ImpasseTranslations: true,
        ImpasseNewNameTranslations: true,
        ImpasseOldNameTranslations: true,
      },
    });
  }

  async remove(data: DeleteDto): Promise<ImpasseInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.impasse.delete({
        where: { id: data.id },
        include: {
          ImpasseTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          ImpasseNewNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          ImpasseOldNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
    }

    return await this.prisma.impasse.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        ImpasseTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        ImpasseNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        ImpasseOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }

  async restore(data: GetOneDto): Promise<ImpasseInterfaces.Response> {
    return this.prisma.impasse.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        ImpasseTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        ImpasseNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        ImpasseOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }
}
