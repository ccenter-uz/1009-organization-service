import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NearbyCreateDto,
  NearbyUpdateDto,
  NearbyInterfaces,
  NearbyFilterDto,
} from 'types/organization/nearby';
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
import { NearbyCategoryService } from '../nearby-category/nearby-category.service';
@Injectable()
export class NearbyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly nearbyCategoryService: NearbyCategoryService
  ) {}

  async create(data: NearbyCreateDto): Promise<NearbyInterfaces.Response> {
    const region = await this.regionService.findOne({
      id: data.regionId,
    });

    const nearbyCategory = await this.nearbyCategoryService.findOne({
      id: data.nearbyCategoryId,
    });
    const city = await this.cityService.findOne({
      id: data.cityId,
    });
    const nearby = await this.prisma.nearby.create({
      data: {
        nearbyCategoryId: nearbyCategory.id,
        regionId: region.id,
        cityId: city.id,
        staffNumber: data.staffNumber,
        NearbyTranslations: {
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
        NearbyTranslations: true,
      },
    });
    return nearby;
  }

  async findAll(
    data: NearbyFilterDto
  ): Promise<NearbyInterfaces.ResponseWithPagination> {
    if (data.all) {
      const nearby = await this.prisma.nearby.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          nearbyCategoryId: data.nearbyCategoryId,
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
        },
        include: {
          NearbyTranslations: {
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
          Region: {
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
          City: {
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
          NearbyCategory: {
            select: {
              id: true,
              name: true,
              staffNumber: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              deletedAt: true,
            },
          },
        },
      });

      const formattedDistrict = [];

      for (let i = 0; i < nearby.length; i++) {
        const nearbyData: any = nearby[i];
        const translations = nearbyData.NearbyTranslations;
        const name = formatLanguageResponse(translations);
        delete nearbyData.NearbyTranslations;

        const regionTranslations = nearbyData.Region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete nearbyData.Region.RegionTranslations;
        const region = { ...nearbyData.Region, name: regionName };
        delete nearbyData.Region;

        const cityTranslations = nearbyData.City.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete nearbyData.City.CityTranslations;
        const city = { ...nearbyData.City, name: cityName };
        delete nearbyData.City;

        nearbyData.category = nearbyData.NearbyCategory;
        delete nearbyData.NearbyCategory;
        formattedDistrict.push({
          ...nearbyData,
          name,
          region,
          city,
        });
      }

      return {
        data: formattedDistrict,
        totalDocs: nearby.length,
        totalPage: 1,
      };
    }

    const where: any = {
      ...(data.status == 2
        ? {}
        : {
            status: data.status,
          }),
      nearbyCategoryId: data.nearbyCategoryId,
    };

    if (data.search) {
      where.NearbyTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
            mode: 'insensitive',
          },
        },
      };
    }

    const count = await this.prisma.nearby.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const nearby = await this.prisma.nearby.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        NearbyTranslations: {
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
        Region: {
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
        City: {
          include: {
            CityTranslations: {
              select: {
                languageCode: true,
                name: true,
              },
            },
          },
        },
        NearbyCategory: {
          select: {
            id: true,
            name: true,
            staffNumber: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
        },
      },
      take: pagination.take,
      skip: pagination.skip,
    });

    const formattedNearby = [];

    for (let i = 0; i < nearby.length; i++) {
      const nearbyData: any = nearby[i];
      const translations = nearbyData.NearbyTranslations;
      const name = formatLanguageResponse(translations);

      delete nearbyData.NearbyTranslations;

      const regionTranslations = nearbyData.Region.RegionTranslations;
      const regionName = formatLanguageResponse(regionTranslations);
      delete nearbyData.Region.RegionTranslations;
      const region = { ...nearbyData.Region, name: regionName };
      delete nearbyData.Region;

      const cityTranslations = nearbyData.City.CityTranslations;
      const cityName = formatLanguageResponse(cityTranslations);
      delete nearbyData.City.CityTranslations;
      const city = { ...nearbyData.City, name: cityName };
      delete nearbyData.City;

      nearbyData.category = nearbyData.NearbyCategory;
      delete nearbyData.NearbyCategory;

      formattedNearby.push({
        ...nearbyData,
        name,
        region,
        city,
      });
    }

    return {
      data: formattedNearby,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<NearbyInterfaces.Response> {
    const nearby: any = await this.prisma.nearby.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        NearbyTranslations: {
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
        Region: {
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
        City: {
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
        NearbyCategory: {
          select: {
            id: true,
            name: true,
            staffNumber: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!nearby) {
      throw new NotFoundException('Nearby is not found');
    }
    const name = formatLanguageResponse(nearby.NearbyTranslations);
    delete nearby.NearbyTranslations;

    const regionTranslations = nearby.Region.RegionTranslations;
    const regionName = formatLanguageResponse(regionTranslations);
    delete nearby.Region.RegionTranslations;
    const region = { ...nearby.Region, name: regionName };
    delete nearby.Region;

    const cityTranslations = nearby.City.CityTranslations;
    const cityName = formatLanguageResponse(cityTranslations);
    delete nearby.City.CityTranslations;
    const city = { ...nearby.City, name: cityName };
    delete nearby.City;

    nearby.category = nearby.NearbyCategory;
    delete nearby.NearbyCategory;

    return { ...nearby, name, region, city };
  }

  async update(data: NearbyUpdateDto): Promise<NearbyInterfaces.Response> {
    const nearby = await this.findOne({ id: data.id });
    if (data.nearbyCategoryId) {
      await this.nearbyCategoryService.findOne({ id: data.nearbyCategoryId });
    }

    if (data.regionId) {
      await this.regionService.findOne({ id: data.regionId });
    }

    if (data.cityId) {
      await this.cityService.findOne({ id: data.cityId });
    }

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

    return await this.prisma.nearby.update({
      where: {
        id: nearby.id,
      },
      data: {
        nearbyCategoryId: data.nearbyCategoryId || nearby.nearbyCategoryId,
        regionId: data.regionId || nearby.regionId,
        cityId: data.cityId || nearby.cityId,
        staffNumber: data.staffNumber || nearby.staffNumber,
        NearbyTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
      },
      include: {
        NearbyTranslations: true,
      },
    });
  }

  async remove(data: DeleteDto): Promise<NearbyInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.nearby.delete({
        where: { id: data.id },
        include: {
          NearbyTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
    }

    return await this.prisma.nearby.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        NearbyTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }

  async restore(data: GetOneDto): Promise<NearbyInterfaces.Response> {
    return this.prisma.nearby.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        NearbyTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }
}
