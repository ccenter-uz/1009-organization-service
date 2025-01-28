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
  StreetCreateDto,
  StreetInterfaces,
  StreetUpdateDto,
} from 'types/organization/street';
import { CityRegionFilterDto } from 'types/global-filters/city-region-filter';
@Injectable()
export class StreetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService
  ) {}

  async create(data: StreetCreateDto): Promise<StreetInterfaces.Response> {
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
      names.StreetNewNameTranslations = {
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
      names.StreetOldNameTranslations = {
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

    const street = await this.prisma.street.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        ...(data.districtId ? { districtId: district.id } : {}),
        index: data.index,
        staffNumber: data.staffNumber,
        orderNumber: data.orderNumber,
        StreetTranslations: {
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
        StreetTranslations: true,
        StreetNewNameTranslations: true,
        StreetOldNameTranslations: true,
      },
    });
    return street;
  }

  async findAll(
    data: CityRegionFilterDto
  ): Promise<StreetInterfaces.ResponseWithPagination> {
    if (data.all) {
      const streets = await this.prisma.street.findMany({
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
          StreetTranslations: {
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
          StreetOldNameTranslations: {
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
          StreetNewNameTranslations: {
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

      const formattedStreet = [];

      for (let i = 0; i < streets.length; i++) {
        const streetData = streets[i];
        const translations = streetData.StreetTranslations;
        const name = formatLanguageResponse(translations);
        const translationsNew = streetData.StreetNewNameTranslations;
        const nameNew = formatLanguageResponse(translationsNew);
        const translationsOld = streetData.StreetOldNameTranslations;
        const nameOld = formatLanguageResponse(translationsOld);

        delete streetData.StreetTranslations;
        delete streetData.StreetNewNameTranslations;
        delete streetData.StreetOldNameTranslations;

        const regionTranslations = streetData.region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete streetData.region.RegionTranslations;
        const region = { ...streetData.region, name: regionName };
        delete streetData.region;

        const cityTranslations = streetData.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete streetData.city.CityTranslations;
        const city = { ...streetData.city, name: cityName };
        delete streetData.city;

        const districtData = streetData?.district;
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
          ...districtData,
          name: districtName,
          newName: districtNameNew,
          oldName: districtNameOld,
        };
        formattedStreet.push({
          ...streetData,
          name,
          newName: nameNew,
          oldName: nameOld,
          region,
          city,
          district,
        });
      }

      return {
        data: formattedStreet,
        totalDocs: streets.length,
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
      where.StreetTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
            mode: 'insensitive',
          },
        },
      };
    }
    const count = await this.prisma.street.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const streets = await this.prisma.street.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        StreetTranslations: {
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
        StreetNewNameTranslations: {
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
        StreetOldNameTranslations: {
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

    const formattedStreet = [];

    for (let i = 0; i < streets.length; i++) {
      const streetData = streets[i];
      const translations = streetData.StreetTranslations;
      const name = formatLanguageResponse(translations);
      const translationsNew = streetData.StreetNewNameTranslations;
      const nameNew = formatLanguageResponse(translationsNew);
      const translationsOld = streetData.StreetOldNameTranslations;
      const nameOld = formatLanguageResponse(translationsOld);

      delete streetData.StreetTranslations;
      delete streetData.StreetNewNameTranslations;
      delete streetData.StreetOldNameTranslations;

      const regionTranslations = streetData.region.RegionTranslations;
      const regionName = formatLanguageResponse(regionTranslations);
      delete streetData.region.RegionTranslations;
      const region = { ...streetData.region, name: regionName };
      delete streetData.region;

      const cityTranslations = streetData.city.CityTranslations;
      const cityName = formatLanguageResponse(cityTranslations);
      delete streetData.city.CityTranslations;
      const city = { ...streetData.city, name: cityName };
      delete streetData.city;

      const districtData = streetData?.district;
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
        ...districtData,
        name: districtName,
        newName: districtNameNew,
        oldName: districtNameOld,
      };

      formattedStreet.push({
        ...streetData,
        name,
        newName: nameNew,
        oldName: nameOld,
        region,
        city,
        district,
      });
    }

    return {
      data: formattedStreet,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<StreetInterfaces.Response> {
    const street = await this.prisma.street.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        StreetTranslations: {
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
        StreetNewNameTranslations: {
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
        StreetOldNameTranslations: {
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
    if (!street) {
      throw new NotFoundException('Street is not found');
    }
    const name = formatLanguageResponse(street.StreetTranslations);
    const nameNew = formatLanguageResponse(street.StreetNewNameTranslations);
    const nameOld = formatLanguageResponse(street.StreetOldNameTranslations);

    delete street.StreetNewNameTranslations;
    delete street.StreetOldNameTranslations;
    delete street.StreetTranslations;

    const regionTranslations = street.region.RegionTranslations;
    const regionName = formatLanguageResponse(regionTranslations);
    delete street.region.RegionTranslations;
    const region = { ...street.region, name: regionName };
    delete street.region;

    const cityTranslations = street.city.CityTranslations;
    const cityName = formatLanguageResponse(cityTranslations);
    delete street.city.CityTranslations;
    const city = { ...street.city, name: cityName };
    delete street.city;

    const districtData = street?.district;
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
      ...districtData,
      name: districtName,
      newName: districtNameNew,
      oldName: districtNameOld,
    };

    return {
      ...street,
      name,
      newName: nameNew,
      oldName: nameOld,
      region,
      city,
      district,
    };
  }

  async update(data: StreetUpdateDto): Promise<StreetInterfaces.Response> {
    const street = await this.findOne({ id: data.id });

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

    return await this.prisma.street.update({
      where: {
        id: street.id,
      },
      data: {
        regionId: data.regionId || street.regionId,
        cityId: data.cityId || street.cityId,
        districtId: data.districtId || null,
        staffNumber: data.staffNumber || street.staffNumber,
        index: data.index || street.index,
        orderNumber: data.orderNumber,
        StreetTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
        StreetNewNameTranslations: {
          updateMany:
            translationNewNameUpdates.length > 0
              ? translationNewNameUpdates
              : undefined,
        },
        StreetOldNameTranslations: {
          updateMany:
            translationOldNameUpdates.length > 0
              ? translationOldNameUpdates
              : undefined,
        },
      },
      include: {
        StreetTranslations: true,
        StreetNewNameTranslations: true,
        StreetOldNameTranslations: true,
      },
    });
  }

  async remove(data: DeleteDto): Promise<StreetInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.street.delete({
        where: { id: data.id },
        include: {
          StreetTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          StreetNewNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          StreetOldNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
    }

    return await this.prisma.street.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        StreetTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        StreetNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        StreetOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }

  async restore(data: GetOneDto): Promise<StreetInterfaces.Response> {
    return this.prisma.street.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        StreetTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        StreetNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        StreetOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }
}
