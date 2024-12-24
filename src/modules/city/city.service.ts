import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CityCreateDto,
  CityUpdateDto,
  CityInterfaces,
} from 'types/organization/city';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestEnum,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { createPagination } from '@/common/helper/pagination.helper';
import { RegionService } from '../region/region.service';
import { CityFilterDto } from 'types/organization/city/dto/filter-city.dto';
@Injectable()
export class CityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService
  ) {}

  async create(data: CityCreateDto): Promise<CityInterfaces.Response> {
    const region = await this.regionService.findOne({
      id: data.regionId,
    });
    const city = await this.prisma.city.create({
      data: {
        regionId: region.id,
        CityTranslations: {
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
        Region: true,
        CityTranslations: true,
      },
    });
    return city;
  }

  async findAll(
    data: CityFilterDto
  ): Promise<CityInterfaces.ResponseWithPagination> {
    if (data.all) {
      const cities = await this.prisma.city.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
          regionId: data.regionId,
        },
        include: {
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
      });

      const formattedCity = [];

      for (let i = 0; i < cities.length; i++) {
        const formatedCity = cities[i];
        const translations = formatedCity.CityTranslations;
        const name = formatLanguageResponse(translations);
  
        delete formatedCity.CityTranslations;
  
        const regionTranslations = formatedCity.Region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
  
        delete formatedCity.Region.RegionTranslations;
  
        const region = { ...formatedCity.Region, name: regionName };
  
        delete formatedCity.Region;
  
        formattedCity.push({ ...formatedCity, name, region });
      }
      return {
        data: formattedCity,
        totalDocs: cities.length,
        totalPage: 1,
      };
    }

    const where: any = {
      ...(data.status == 2
        ? {}
        : {
            status: data.status,
          }),
      regionId: data.regionId,
    };
    if (data.search) {
      where.CityTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
            mode: 'insensitive',
          },
        },
      };
    }
    const count = await this.prisma.city.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const city = await this.prisma.city.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
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
        CityTranslations: {
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

    const formattedCity = [];

    for (let i = 0; i < city.length; i++) {
      const formatedCity = city[i];
      const translations = formatedCity.CityTranslations;
      const name = formatLanguageResponse(translations);

      delete formatedCity.CityTranslations;

      const regionTranslations = formatedCity.Region.RegionTranslations;
      const regionName = formatLanguageResponse(regionTranslations);

      delete formatedCity.Region.RegionTranslations;

      const region = { ...formatedCity.Region, name: regionName };

      delete formatedCity.Region;

      formattedCity.push({ ...formatedCity, name, region });
    }

    return {
      data: formattedCity,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<CityInterfaces.Response> {
    const city = await this.prisma.city.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        Region: true,
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
    });
    if (!city) {
      throw new NotFoundException('city is not found');
    }
    const name = formatLanguageResponse(city.CityTranslations);
    return { ...city, name };
  }

  async update(data: CityUpdateDto): Promise<CityInterfaces.Response> {
    const city = await this.findOne({ id: data.id });

    if (data.regionId) {
      await this.regionService.findOne({ id: data.regionId });
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

    return await this.prisma.city.update({
      where: {
        id: city.id,
      },
      data: {
        regionId: data.regionId || city.regionId,
        CityTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
      },
      include: {
        Region: true,
        CityTranslations: true,
      },
    });
  }

  async remove(data: DeleteDto): Promise<CityInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.city.delete({
        where: { id: data.id },
        include: {
          Region: true,
          CityTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
    }

    return await this.prisma.city.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        Region: true,
        CityTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }

  async restore(data: GetOneDto): Promise<CityInterfaces.Response> {
    return this.prisma.city.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        Region: true,
        CityTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }
}
