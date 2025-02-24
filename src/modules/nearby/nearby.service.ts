import { Injectable, NotFoundException, Logger } from '@nestjs/common';
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
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { createPagination } from '@/common/helper/pagination.helper';
import { RegionService } from '../region/region.service';
import { CityService } from '../city/city.service';
import { NearbyCategoryService } from '../nearby-category/nearby-category.service';
import { getNearbyOrderedData } from '@/common/helper/sql-rows-for-select/get-nearby-ordered-data.dto';
import { Prisma } from '@prisma/client';
import { DistrictService } from '../district/district.service';
@Injectable()
export class NearbyService {
  private logger = new Logger(NearbyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly nearbyCategoryService: NearbyCategoryService,
    private readonly districtService: DistrictService
  ) {}

  async create(data: NearbyCreateDto): Promise<NearbyInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const region = await this.regionService.findOne({
      id: data.regionId,
    });

    const nearbyCategory = await this.nearbyCategoryService.findOne({
      id: data.nearbyCategoryId,
    });
    const city = await this.cityService.findOne({
      id: data.cityId,
    });
    const district = await this.districtService.findOne({
      id: data.districtId,
    });
    const nearby = await this.prisma.nearby.create({
      data: {
        nearbyCategoryId: nearbyCategory.id,
        regionId: region.id,
        cityId: city.id,
        ...(data.districtId ? { districtId: district.id } : {}),
        staffNumber: data.staffNumber,
        orderNumber: data.orderNumber,
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
        City: {
          include: {
            CityTranslations: true,
          },
        },
        Region: {
          include: {
            RegionTranslations: true,
          },
        },
        District: {
          include: {
            DistrictTranslations: true,
            DistrictNewNameTranslations: true,
            DistrictOldNameTranslations: true,
          },
        },
      },
    });
    this.logger.debug(`Method: ${methodName} - Response: `, nearby);

    return nearby;
  }

  async findAll(
    data: NearbyFilterDto
  ): Promise<NearbyInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);

    if (data.all) {
      const nearby = await getNearbyOrderedData(
        'Nearby',
        'nearby',
        this.prisma,
        data
      );

      const formattedNearby = [];

      for (let i = 0; i < nearby.length; i++) {
        const nearbyData: any = nearby[i];
        const translations = nearbyData.NearbyTranslations;
        const name = formatLanguageResponse(translations);
        delete nearbyData.NearbyTranslations;

        const regionTranslations = nearbyData.region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete nearbyData.region.RegionTranslations;
        const region = { ...nearbyData.region, name: regionName };
        delete nearbyData.region;

        const cityTranslations = nearbyData.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete nearbyData.city.CityTranslations;
        const city = { ...nearbyData.city, name: cityName };
        delete nearbyData.city;

        nearbyData.category = nearbyData.nearbycategory;
        delete nearbyData.nearbycategory;
        formattedNearby.push({
          ...nearbyData,
          name,
          region,
          city,
        });
      }
      this.logger.debug(`Method: ${methodName} - Response: `, formattedNearby);

      return {
        data: formattedNearby,
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
      cityId: data.cityId,
      regionId: data.regionId,
    };

    if (data.search) {
      where.NearbyTranslations = {
        some: {
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

    const nearby = await getNearbyOrderedData(
      'Nearby',
      'nearby',
      this.prisma,
      data,
      pagination
    );

    const formattedNearby = [];

    for (let i = 0; i < nearby.length; i++) {
      const nearbyData: any = nearby[i];
      const translations = nearbyData.NearbyTranslations;
      const name = formatLanguageResponse(translations);

      delete nearbyData.NearbyTranslations;

      const regionTranslations = nearbyData.region.RegionTranslations;
      const regionName = formatLanguageResponse(regionTranslations);
      delete nearbyData.region.RegionTranslations;
      const region = { ...nearbyData.region, name: regionName };
      delete nearbyData.region;

      const cityTranslations = nearbyData.city.CityTranslations;
      const cityName = formatLanguageResponse(cityTranslations);
      delete nearbyData.city.CityTranslations;
      const city = { ...nearbyData.city, name: cityName };
      delete nearbyData.city;

      nearbyData.category = nearbyData.nearbycategory;
      delete nearbyData.nearbycategory;

      formattedNearby.push({
        ...nearbyData,
        name,
        region,
        city,
      });
    }
    this.logger.debug(`Method: ${methodName} - Response: `, formattedNearby);
    return {
      data: formattedNearby,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<NearbyInterfaces.Response> {
    const methodName: string = this.findOne.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
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
        District: {
          include: {
            DistrictTranslations: true,
            DistrictNewNameTranslations: true,
            DistrictOldNameTranslations: true,
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
    this.logger.debug(`Method: ${methodName} - Response: `, nearby);
    if (nearby.District) {
      const districtName = formatLanguageResponse(
        nearby.District.DistrictTranslations
      );
      const districtNewName = formatLanguageResponse(
        nearby.District.DistrictNewNameTranslations
      );
      const districtOldName = formatLanguageResponse(
        nearby.District.DistrictOldNameTranslations
      );

      delete nearby.District.DistrictTranslations;
      delete nearby.District.DistrictNewNameTranslations;
      delete nearby.District.DistrictOldNameTranslations;

      let district = {
        ...nearby.District,
        name: districtName,
        oldName: districtOldName,
        newName: districtNewName,
      };
      delete nearby.District;
      nearby.district = { ...district };
    } else {
      nearby.district = null;
      delete nearby.District;
    }
    return { ...nearby, name, region, city };
  }

  async update(data: NearbyUpdateDto): Promise<NearbyInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
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

    if (data.districtId) {
      await this.districtService.findOne({ id: data.districtId });
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

    const updatedNearby = await this.prisma.nearby.update({
      where: {
        id: nearby.id,
      },
      data: {
        nearbyCategoryId: data.nearbyCategoryId || nearby.nearbyCategoryId || null,
        regionId: data.regionId || nearby.regionId || null,
        cityId: data.cityId || nearby.cityId || null,
        districtId: data.districtId || nearby?.districtId || null,
        staffNumber: data.staffNumber || nearby.staffNumber || null,
        orderNumber: data.orderNumber || null,
        NearbyTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
      },
      include: {
        NearbyTranslations: true,
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
        City: {
          include: {
            CityTranslations: true,
          },
        },
        Region: {
          include: {
            RegionTranslations: true,
          },
        },
        District: {
          include: {
            DistrictTranslations: true,
            DistrictNewNameTranslations: true,
            DistrictOldNameTranslations: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updatedNearby);

    return updatedNearby;
  }

  async remove(data: DeleteDto): Promise<NearbyInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.delete) {
      const deletedNearby = await this.prisma.nearby.delete({
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

      this.logger.debug(`Method: ${methodName} - Response: `, deletedNearby);

      return deletedNearby;
    }

    const updatedNearby = await this.prisma.nearby.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        NearbyTranslations: {
          select: {
            languageCode: true,
            name: true,
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
        City: {
          include: {
            CityTranslations: true,
          },
        },
        Region: {
          include: {
            RegionTranslations: true,
          },
        },
        District: {
          include: {
            DistrictTranslations: true,
            DistrictNewNameTranslations: true,
            DistrictOldNameTranslations: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updatedNearby);

    return updatedNearby;
  }

  async restore(data: GetOneDto): Promise<NearbyInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const updatedNearby = this.prisma.nearby.update({
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
        City: {
          include: {
            CityTranslations: true,
          },
        },
        Region: {
          include: {
            RegionTranslations: true,
          },
        },
        District: {
          include: {
            DistrictTranslations: true,
            DistrictNewNameTranslations: true,
            DistrictOldNameTranslations: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updatedNearby);

    return updatedNearby;
  }
}
