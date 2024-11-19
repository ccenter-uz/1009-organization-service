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
  LanguageRequestDto,
  LanguageRequestEnum,
  ListQueryDto,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { createPagination } from '@/common/helper/pagination.helper';
import { RegionService } from '../region/region.service';
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
        CityTranslations: true,
      },
    });
    return city;
  }

  async findAll(
    data: LanguageRequestDto
  ): Promise<CityInterfaces.ResponseWithoutPagination> {
    const cities = await this.prisma.city.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        CityTranslations: {
          where: data.all_lang
            ? {}
            : {
                languageCode: data.lang_code,
              },
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    const formattedSubCategories = [];

    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      const translations = city.CityTranslations;
      const name = formatLanguageResponse(translations);

      delete city.CityTranslations;

      formattedSubCategories.push({ ...city, name });
    }

    return {
      data: formattedSubCategories,
      totalDocs: cities.length,
    };
  }

  async findAllByPagination(
    data: ListQueryDto
  ): Promise<CityInterfaces.ResponseWithPagination> {
    const where: any = { status: DefaultStatus.ACTIVE };
    if (data.search) {
      where.CityTranslations = {
        some: {
          languageCode: data.lang_code,
          name: {
            contains: data.search,
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
      where: {
        status: DefaultStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        CityTranslations: {
          where: data.all_lang
            ? {}
            : {
                languageCode: data.lang_code,
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

    const formattedSubCategories = [];

    for (let i = 0; i < city.length; i++) {
      const subCategory = city[i];
      const translations = subCategory.CityTranslations;
      const name = formatLanguageResponse(translations);

      delete subCategory.CityTranslations;

      formattedSubCategories.push({ ...subCategory, name });
    }

    return {
      data: formattedSubCategories,
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
        CityTranslations: {
          where: data.all_lang
            ? {}
            : {
                languageCode: data.lang_code,
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
        CityTranslations: true,
      },
    });
  }

  async remove(data: DeleteDto): Promise<CityInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.city.delete({
        where: { id: data.id },
        include: {
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
