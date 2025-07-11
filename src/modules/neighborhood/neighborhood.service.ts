import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
  NeighborhoodCreateDto,
  NeighborhoodUpdateDto,
  NeighborhoodInterfaces,
} from 'types/organization/neighborhood';
import { CityRegionFilterDto } from 'types/global/dto/city-region-filter.dto';
import { Prisma } from '@prisma/client';
import { getOrderedDataWithDistrict } from '@/common/helper/sql-rows-for-select/get-ordered-data-with-district.dto';
@Injectable()
export class NeighborhoodService {
  private logger = new Logger(NeighborhoodService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService
  ) {}

  async create(
    data: NeighborhoodCreateDto
  ): Promise<NeighborhoodInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
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
      names.NeighborhoodNewNameTranslations = {
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
      names.NeighborhoodOldNameTranslations = {
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

    const neighborhood = await this.prisma.neighborhood.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        ...(data.districtId ? { districtId: district.id } : {}),
        index: data.index,
        staffNumber: data.staffNumber,
        orderNumber: data.orderNumber,
        NeighborhoodTranslations: {
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
        NeighborhoodTranslations: true,
        NeighborhoodNewNameTranslations: true,
        NeighborhoodOldNameTranslations: true,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, neighborhood);

    await this.prisma.$executeRawUnsafe(`
        UPDATE neighborhood_translations 
        SET search_vector = to_tsvector('simple', name) 
        WHERE neighborhood_id = ${neighborhood.id}
      `);

    this.logger.debug(
      `Method: ${methodName} - Updating translation for tsvector`
    );

    return neighborhood;
  }

  async findAll(
    data: CityRegionFilterDto
  ): Promise<NeighborhoodInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.all) {
      let neighborhoods = await getOrderedDataWithDistrict(
        'Neighborhood',
        'neighborhood',
        this.prisma,
        data
      );

      this.logger.debug(`Method: ${methodName} - Response: `, neighborhoods);

      return {
        data: neighborhoods,
        totalDocs: neighborhoods.length,
        totalPage: neighborhoods.length > 0 ? 1 : 0,
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
      districtId: data.districtId,
    };
    if (data.search) {
      where.OR = [
        {
          NeighborhoodTranslations: {
            some: {
              name: {
                contains: data.search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          NeighborhoodNewNameTranslations: {
            some: {
              name: {
                contains: data.search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          NeighborhoodOldNameTranslations: {
            some: {
              name: {
                contains: data.search,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }
    const count = await this.prisma.neighborhood.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    let neighborhoods = await getOrderedDataWithDistrict(
      'Neighborhood',
      'neighborhood',
      this.prisma,
      data,
      pagination
    );

    this.logger.debug(`Method: ${methodName} - Response: `, neighborhoods);
    return {
      data: neighborhoods,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<NeighborhoodInterfaces.Response> {
    const methodName: string = this.findOne.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const residentialArea = await this.prisma.neighborhood.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        NeighborhoodTranslations: {
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
        NeighborhoodNewNameTranslations: {
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
        NeighborhoodOldNameTranslations: {
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
    if (!residentialArea) {
      throw new NotFoundException('Neighborhood is not found');
    }
    const name = formatLanguageResponse(
      residentialArea.NeighborhoodTranslations
    );
    const nameNew = formatLanguageResponse(
      residentialArea.NeighborhoodNewNameTranslations
    );
    const nameOld = formatLanguageResponse(
      residentialArea.NeighborhoodOldNameTranslations
    );
    delete residentialArea.NeighborhoodNewNameTranslations;
    delete residentialArea.NeighborhoodOldNameTranslations;
    delete residentialArea.NeighborhoodTranslations;
    const regionTranslations = residentialArea.region.RegionTranslations;
    const regionName = formatLanguageResponse(regionTranslations);
    delete residentialArea.region.RegionTranslations;
    const region = { ...residentialArea.region, name: regionName };
    delete residentialArea.region;

    const cityTranslations = residentialArea.city.CityTranslations;
    const cityName = formatLanguageResponse(cityTranslations);
    delete residentialArea.city.CityTranslations;
    const city = { ...residentialArea.city, name: cityName };
    delete residentialArea.city;

    const districtData = residentialArea?.district;
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
    this.logger.debug(`Method: ${methodName} - Response: `, residentialArea);

    return {
      ...residentialArea,
      name,
      newName: nameNew,
      oldName: nameOld,
      region,
      city,
      district,
    };
  }

  async update(
    data: NeighborhoodUpdateDto
  ): Promise<NeighborhoodInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const neighborhood = await this.findOne({ id: data.id });

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

    const updatedNeighborhood = await this.prisma.neighborhood.update({
      where: {
        id: neighborhood.id,
      },
      data: {
        regionId: data.regionId || neighborhood.regionId,
        cityId: data.cityId || neighborhood.cityId,
        districtId: data.districtId || null,
        editedStaffNumber: data.staffNumber,
        index: data.index || neighborhood.index,
        orderNumber: data.orderNumber,
        NeighborhoodTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
        NeighborhoodNewNameTranslations: {
          updateMany:
            translationNewNameUpdates.length > 0
              ? translationNewNameUpdates
              : undefined,
        },
        NeighborhoodOldNameTranslations: {
          updateMany:
            translationOldNameUpdates.length > 0
              ? translationOldNameUpdates
              : undefined,
        },
      },
      include: {
        NeighborhoodTranslations: true,
        NeighborhoodNewNameTranslations: true,
        NeighborhoodOldNameTranslations: true,
      },
    });

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedNeighborhood
    );

    return updatedNeighborhood;
  }

  async remove(data: DeleteDto): Promise<NeighborhoodInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.delete) {
      const deletedNeighborhood = await this.prisma.neighborhood.delete({
        where: { id: data.id },
        include: {
          NeighborhoodTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          NeighborhoodNewNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          NeighborhoodOldNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });

      this.logger.debug(
        `Method: ${methodName} - Response: `,
        deletedNeighborhood
      );

      return deletedNeighborhood;
    }

    const updatedNeighborhood = await this.prisma.neighborhood.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        NeighborhoodTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        NeighborhoodNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        NeighborhoodOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedNeighborhood
    );

    return updatedNeighborhood;
  }

  async restore(data: GetOneDto): Promise<NeighborhoodInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const updatedNeighborhood = this.prisma.neighborhood.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        NeighborhoodTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        NeighborhoodNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        NeighborhoodOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedNeighborhood
    );

    return updatedNeighborhood;
  }
}
