import { Injectable, NotFoundException, Logger } from '@nestjs/common';
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
import { Prisma } from '@prisma/client';
import { getCityData } from '@/common/helper/sql-rows-for-select/get-city-data.dto';
@Injectable()
export class CityService {
  private logger = new Logger(CityService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService
  ) {}

  async create(data: CityCreateDto): Promise<CityInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
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
    this.logger.debug(`Method: ${methodName} - Response: `, city);

    return city;
  }

  async findAll(
    data: CityFilterDto
  ): Promise<CityInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);

   
    if (data.all) {
      const cities = await getCityData(
        'City',
        'city',
        this.prisma,
        data,
      );

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

      this.logger.debug(`Method: ${methodName} -  Response: `, formattedCity);

      return {
        data: formattedCity,
        totalDocs: cities.length,
        totalPage: cities.length > 0 ? 1 : 0,
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

    const city = await getCityData(
      'City',
      'city',
      this.prisma,
      data,
      pagination
    );

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

    this.logger.debug(`Method: ${methodName} - Response: `, formattedCity);

    return {
      data: formattedCity,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<CityInterfaces.Response> {
    const methodName: string = this.findOne.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

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
    this.logger.debug(`Method: ${methodName} - Response: `, city);

    return { ...city, name };
  }

  async update(data: CityUpdateDto): Promise<CityInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

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

    const updatedCity = await this.prisma.city.update({
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

    this.logger.debug(`Method: ${methodName} - Response: `, updatedCity);

    return updatedCity;
  }

  async remove(data: DeleteDto): Promise<CityInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    if (data.delete) {
      const city = await this.prisma.city.delete({
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
      this.logger.debug(
        `Method: ${methodName} - Rresponse when delete true: `,
        city
      );
      return city;
    }

    const city = await this.prisma.city.update({
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

    this.logger.debug(
      `Method: ${methodName} - Rresponse when delete true: `,
      city
    );
    return city;
  }

  async restore(data: GetOneDto): Promise<CityInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const city = this.prisma.city.update({
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
    this.logger.debug(
      `Method: ${methodName} - Rresponse when delete true: `,
      city
    );
    return city;
  }
}
