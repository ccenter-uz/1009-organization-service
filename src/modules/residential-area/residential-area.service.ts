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
  ResidentialAreaCreateDto,
  ResidentialAreaInterfaces,
  ResidentialAreaUpdateDto,
} from 'types/organization/residential-area';
import { CityRegionFilterDto } from 'types/global/dto/city-region-filter.dto';
import { Prisma } from '@prisma/client';
import { getOrderedDataWithDistrict } from '@/common/helper/sql-rows-for-select/get-ordered-data-with-district.dto';
@Injectable()
export class ResidentialAreaService {
  private logger = new Logger(ResidentialAreaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService
  ) {}

  async create(
    data: ResidentialAreaCreateDto
  ): Promise<ResidentialAreaInterfaces.Response> {
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
      names.ResidentialAreaNewNameTranslations = {
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
      names.ResidentialAreaOldNameTranslations = {
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

    const residentialArea = await this.prisma.residentialArea.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        ...(data.districtId ? { districtId: district.id } : {}),
        index: data.index,
        staffNumber: data.staffNumber,
        orderNumber: data.orderNumber,
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
        ...names,
      },
      include: {
        ResidentialAreaTranslations: true,
        ResidentialAreaNewNameTranslations: true,
        ResidentialAreaOldNameTranslations: true,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, residentialArea);

    await this.prisma.$executeRawUnsafe(`
      UPDATE residential_area_translations 
      SET search_vector = to_tsvector('simple', name) 
      WHERE residential_area_id = ${residentialArea.id}
    `);

    this.logger.debug(
      `Method: ${methodName} - Updating translation for tsvector`
    );

    return residentialArea;
  }

  async findAll(
    data: CityRegionFilterDto
  ): Promise<ResidentialAreaInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.all) {
      let residentialAreas = await getOrderedDataWithDistrict(
        'ResidentialArea',
        'residential_area',
        this.prisma,
        data
      );

      const formattedResidentialArea = [];

      for (let i = 0; i < residentialAreas.length; i++) {
        let residentialAreaData = residentialAreas[i];
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

        const regionTranslations =
          residentialAreaData.region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete residentialAreaData.region.RegionTranslations;
        const region = { ...residentialAreaData.region, name: regionName };
        delete residentialAreaData.region;

        const cityTranslations = residentialAreaData.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete residentialAreaData.city.CityTranslations;
        const city = { ...residentialAreaData.city, name: cityName };
        delete residentialAreaData.city;
        if (residentialAreaData?.district) {
          const districtData = residentialAreaData?.district;
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
          residentialAreaData = {
            ...residentialAreaData,
            district,
          };
        }
        formattedResidentialArea.push({
          ...residentialAreaData,
          name,
          newName: nameNew,
          oldName: nameOld,

          region,
          city,
        });
      }
      this.logger.debug(
        `Method: ${methodName} - Response: `,
        formattedResidentialArea
      );

      return {
        data: formattedResidentialArea,
        totalDocs: residentialAreas.length,
        totalPage: residentialAreas.length > 0 ? 1 : 0,
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
          ResidentialAreaTranslations: {
            some: {
              name: {
                contains: data.search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          ResidentialAreaNewNameTranslations: {
            some: {
              name: {
                contains: data.search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          ResidentialAreaOldNameTranslations: {
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
    const count = await this.prisma.residentialArea.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    let residentialAreas = await getOrderedDataWithDistrict(
      'ResidentialArea',
      'residential_area',
      this.prisma,
      data,
      pagination
    );
    const formattedResidentialArea = [];

    for (let i = 0; i < residentialAreas.length; i++) {
      let residentialAreaData = residentialAreas[i];
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

      const regionTranslations = residentialAreaData.region.RegionTranslations;
      const regionName = formatLanguageResponse(regionTranslations);
      delete residentialAreaData.region.RegionTranslations;
      const region = { ...residentialAreaData.region, name: regionName };
      delete residentialAreaData.region;

      const cityTranslations = residentialAreaData.city.CityTranslations;
      const cityName = formatLanguageResponse(cityTranslations);
      delete residentialAreaData.city.CityTranslations;
      const city = { ...residentialAreaData.city, name: cityName };
      delete residentialAreaData.city;
      if (residentialAreaData?.district) {
        const districtData = residentialAreaData?.district;
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
        residentialAreaData = {
          ...residentialAreaData,
          district,
        };
      }
      formattedResidentialArea.push({
        ...residentialAreaData,
        name,
        newName: nameNew,
        oldName: nameOld,
        region,
        city,
      });
    }
    this.logger.debug(
      `Method: ${methodName} - Response: `,
      formattedResidentialArea
    );

    return {
      data: formattedResidentialArea,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<ResidentialAreaInterfaces.Response> {
    const methodName: string = this.findOne.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
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
    delete residentialArea.ResidentialAreaNewNameTranslations;
    delete residentialArea.ResidentialAreaOldNameTranslations;
    delete residentialArea.ResidentialAreaTranslations;
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
    data: ResidentialAreaUpdateDto
  ): Promise<ResidentialAreaInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
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

    const updatedResidentialArea = await this.prisma.residentialArea.update({
      where: {
        id: residentialArea.id,
      },
      data: {
        regionId: data.regionId || residentialArea.regionId,
        cityId: data.cityId || residentialArea.cityId,
        districtId: data.districtId || null,
        staffNumber: data.staffNumber || residentialArea.staffNumber,
        index: data.index || residentialArea.index,
        orderNumber: data.orderNumber,
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
    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedResidentialArea
    );

    return updatedResidentialArea;
  }

  async remove(data: DeleteDto): Promise<ResidentialAreaInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.delete) {
      const deletedResidentialArea = await this.prisma.residentialArea.delete({
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

      this.logger.debug(
        `Method: ${methodName} - Response: `,
        deletedResidentialArea
      );

      return deletedResidentialArea;
    }

    const updatedResidentialArea = await this.prisma.residentialArea.update({
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

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedResidentialArea
    );

    return updatedResidentialArea;
  }

  async restore(data: GetOneDto): Promise<ResidentialAreaInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const updatedResidentialArea = this.prisma.residentialArea.update({
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
    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedResidentialArea
    );

    return updatedResidentialArea;
  }
}
