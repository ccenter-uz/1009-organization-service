import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
import { DistrictService } from '../district/district.service';
import {
  VillageCreateDto,
  VillageInterfaces,
  VillageUpdateDto,
} from 'types/organization/village';
import { CityRegionFilterDto } from 'types/global/dto/city-region-filter.dto';
import { getOrderedDataWithDistrict } from '@/common/helper/sql-rows-for-select/get-ordered-data-with-district.dto';

@Injectable()
export class VillageService {
  private logger = new Logger(VillageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService
  ) {}

  async create(data: VillageCreateDto): Promise<VillageInterfaces.Response> {
    try {
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
        names.VillageNewNameTranslations = {
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
        names.VillageOldNameTranslations = {
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

      const village = await this.prisma.village.create({
        data: {
          regionId: region.id,
          cityId: city.id,
          ...(data.districtId ? { districtId: district.id } : {}),
          index: data.index,
          staffNumber: data.staffNumber,
          orderNumber: data.orderNumber,
          VillageTranslations: {
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
          VillageTranslations: true,
          VillageNewNameTranslations: true,
          VillageOldNameTranslations: true,
        },
      });
      this.logger.debug(`Method: ${methodName} - Response: `, village);

      await this.prisma.$executeRawUnsafe(`
        UPDATE village_translations 
        SET search_vector = to_tsvector('simple', name) 
        WHERE village_id = ${village.id}
      `);

      this.logger.debug(
        `Method: ${methodName} - Updating translation for tsvector`
      );

      return village;
    } catch (error) {
      console.log('Error', error);
      throw error;
    }
  }

  async findAll(
    data: CityRegionFilterDto
  ): Promise<VillageInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.all) {
      const villages = await getOrderedDataWithDistrict(
        'Village',
        'village',
        this.prisma,
        data
      );

      this.logger.debug(`Method: ${methodName} - Response: `, villages);

      return {
        data: villages,
        totalDocs: villages.length,
        totalPage: villages.length > 0 ? 1 : 0,
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
          VillageTranslations: {
            some: {
              name: {
                contains: data.search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          VillageNewNameTranslations: {
            some: {
              name: {
                contains: data.search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          VillageOldNameTranslations: {
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

    const count = await this.prisma.village.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const villages = await getOrderedDataWithDistrict(
      'Village',
      'village',
      this.prisma,
      data,
      pagination
    );

    this.logger.debug(`Method: ${methodName} - Response: `, villages);

    return {
      data: villages,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<VillageInterfaces.Response> {
    const methodName: string = this.findOne.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const village = await this.prisma.village.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        VillageTranslations: {
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
        VillageNewNameTranslations: {
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
        VillageOldNameTranslations: {
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

    if (!village) {
      throw new NotFoundException('Village is not found');
    }
    const name = formatLanguageResponse(village.VillageTranslations);
    const nameNew = formatLanguageResponse(
      village.VillageNewNameTranslations || []
    );
    const nameOld = formatLanguageResponse(
      village.VillageOldNameTranslations || []
    );
    delete village.VillageNewNameTranslations;
    delete village.VillageOldNameTranslations;
    delete village.VillageTranslations;

    const regionTranslations = village.region.RegionTranslations;
    const regionName = formatLanguageResponse(regionTranslations);
    delete village.region.RegionTranslations;
    const region = { ...village.region, name: regionName };
    delete village.region;

    const cityTranslations = village.city.CityTranslations;
    const cityName = formatLanguageResponse(cityTranslations);
    delete village.city.CityTranslations;
    const city = { ...village.city, name: cityName };
    delete village.city;

    const districtData = village?.district;
    let districtName: string | object;
    let districtNameNew: string | object;
    let districtNameOld: string | object;

    if (districtData) {
      const districtTranslations = districtData.DistrictTranslations;
      districtName = formatLanguageResponse(districtTranslations);
      const districtTranslationsNew = districtData.DistrictNewNameTranslations;
      districtNameNew = formatLanguageResponse(districtTranslationsNew || []);
      const districtTranslationsOld = districtData.DistrictOldNameTranslations;
      districtNameOld = formatLanguageResponse(districtTranslationsOld || []);
      delete districtData.DistrictTranslations;
      delete districtData.DistrictNewNameTranslations;
      delete districtData.DistrictOldNameTranslations;
    }

    const district = {
      ...village.district,
      name: districtName,
      districtNameNew,
      districtNameOld,
    };
    delete village.district;
    this.logger.debug(`Method: ${methodName} - Response: `, village);

    return {
      ...village,
      name,
      newName: nameNew,
      oldName: nameOld,
      region,
      city,
      district,
    };
  }

  async update(data: VillageUpdateDto): Promise<VillageInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const village = await this.findOne({ id: data.id });

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

    const updatedVillage = await this.prisma.village.update({
      where: {
        id: village.id,
      },
      data: {
        regionId: data.regionId || village.regionId,
        cityId: data.cityId || village.cityId,
        districtId: data.districtId || null,
        editedStaffNumber: data.staffNumber,
        index: data.index || village.index,
        orderNumber: data.orderNumber,
        VillageTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
        VillageNewNameTranslations: {
          updateMany:
            translationNewNameUpdates.length > 0
              ? translationNewNameUpdates
              : undefined,
        },
        VillageOldNameTranslations: {
          updateMany:
            translationOldNameUpdates.length > 0
              ? translationOldNameUpdates
              : undefined,
        },
      },
      include: {
        VillageTranslations: true,
        VillageNewNameTranslations: true,
        VillageOldNameTranslations: true,
      },
    });
    this.logger.debug(`Method: ${methodName} - Response: `, updatedVillage);

    return updatedVillage;
  }

  async remove(data: DeleteDto): Promise<VillageInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.delete) {
      const deletedVillage = await this.prisma.village.delete({
        where: { id: data.id },
        include: {
          VillageTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          VillageNewNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          VillageOldNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
      this.logger.debug(`Method: ${methodName} - Response: `, deletedVillage);

      return deletedVillage;
    }

    const updatedVillage = await this.prisma.village.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        VillageTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        VillageNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        VillageOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updatedVillage);

    return updatedVillage;
  }

  async restore(data: GetOneDto): Promise<VillageInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const updatedVillage = this.prisma.village.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        VillageTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        VillageNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        VillageOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updatedVillage);

    return updatedVillage;
  }
}
