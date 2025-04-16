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
  AvenueCreateDto,
  AvenueInterfaces,
  AvenueUpdateDto,
} from 'types/organization/avenue';
import { CityRegionFilterDto } from 'types/global/dto/city-region-filter.dto';
import { Prisma } from '@prisma/client';
import { getOrderedDataWithDistrict } from '@/common/helper/sql-rows-for-select/get-ordered-data-with-district.dto';
@Injectable()
export class AvenueService {
  private logger = new Logger(AvenueService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService
  ) {}

  async create(data: AvenueCreateDto): Promise<AvenueInterfaces.Response> {
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
      names.AvenueNewNameTranslations = {
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
      names.AvenueOldNameTranslations = {
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
    const avenue = await this.prisma.avenue.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        ...(data.districtId ? { districtId: district.id } : {}),
        index: data.index,
        staffNumber: data.staffNumber,
        orderNumber: data.orderNumber,
        AvenueTranslations: {
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
        AvenueTranslations: true,
        AvenueNewNameTranslations: true,
        AvenueOldNameTranslations: true,
      },
    });
    this.logger.debug(`Method: ${methodName} - Response: `, avenue);

    await this.prisma.$executeRawUnsafe(`
      UPDATE avenue_translations 
      SET search_vector = to_tsvector('simple', name) 
      WHERE avenue_id = ${avenue.id}
    `);

    this.logger.debug(
      `Method: ${methodName} - Updating translation for tsvector`
    );

    return avenue;
  }

  async findAll(
    data: CityRegionFilterDto
  ): Promise<AvenueInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    if (data.all) {
      let avenues = await getOrderedDataWithDistrict(
        'Avenue',
        'avenue',
        this.prisma,
        data
      );
      const formattedAvenue = [];

      for (let i = 0; i < avenues.length; i++) {
        let avenueData = avenues[i];
        const translations = avenueData.AvenueTranslations;
        const name = formatLanguageResponse(translations);
        const translationsNew = avenueData.AvenueNewNameTranslations;
        const nameNew = formatLanguageResponse(translationsNew);
        const translationsOld = avenueData.AvenueOldNameTranslations;
        const nameOld = formatLanguageResponse(translationsOld);
        delete avenueData.AvenueTranslations;
        delete avenueData.AvenueNewNameTranslations;
        delete avenueData.AvenueOldNameTranslations;

        const regionTranslations = avenueData.region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete avenueData.region.RegionTranslations;
        const region = { ...avenueData.region, name: regionName };
        delete avenueData.region;

        const cityTranslations = avenueData.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete avenueData.city.CityTranslations;
        const city = { ...avenueData.city, name: cityName };
        delete avenueData.city;
        if (avenueData?.district) {
          const districtData = avenueData?.district;
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
            ...avenueData.district,
            name: districtName,
            districtNameNew,
            districtNameOld,
          };
          avenueData = {
            ...avenueData,
            district,
          };
        }
        formattedAvenue.push({
          ...avenueData,
          name,
          newName: nameNew,
          oldName: nameOld,
          region,
          city,
        });
      }

      this.logger.debug(`Method: ${methodName} - Response: `, formattedAvenue);

      return {
        data: formattedAvenue,
        totalDocs: avenues.length,
        totalPage: avenues.length > 0 ? 1 : 0,
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
          AvenueTranslations: {
            some: {
              name: {
                contains: data.search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          AvenueNewNameTranslations: {
            some: {
              name: {
                contains: data.search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          AvenueOldNameTranslations: {
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
    const count = await this.prisma.avenue.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    let avenues = await getOrderedDataWithDistrict(
      'Avenue',
      'avenue',
      this.prisma,
      data,
      pagination
    );

    const formattedAvenue = [];

    for (let i = 0; i < avenues.length; i++) {
      let avenueData = avenues[i];
      const translations = avenueData.AvenueTranslations;
      const name = formatLanguageResponse(translations);
      const translationsNew = avenueData.AvenueNewNameTranslations;
      const nameNew = formatLanguageResponse(translationsNew);
      const translationsOld = avenueData.AvenueOldNameTranslations;
      const nameOld = formatLanguageResponse(translationsOld);

      delete avenueData.AvenueTranslations;
      delete avenueData.AvenueNewNameTranslations;
      delete avenueData.AvenueOldNameTranslations;

      const regionTranslations = avenueData.region.RegionTranslations;
      const regionName = formatLanguageResponse(regionTranslations);
      delete avenueData.region.RegionTranslations;
      const region = { ...avenueData.region, name: regionName };
      delete avenueData.region;

      const cityTranslations = avenueData.city.CityTranslations;
      const cityName = formatLanguageResponse(cityTranslations);
      delete avenueData.city.CityTranslations;
      const city = { ...avenueData.city, name: cityName };
      delete avenueData.city;
      if (avenueData?.district) {
        const districtData = avenueData?.district;
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
          ...avenueData.district,
          name: districtName,
          districtNameNew,
          districtNameOld,
        };

        avenueData = {
          ...avenueData,
          district,
        };
      }
      formattedAvenue.push({
        ...avenueData,
        name,
        newName: nameNew,
        oldName: nameOld,
        region,
        city,
      });
    }
    this.logger.debug(`Method: ${methodName} - Response: `, formattedAvenue);

    return {
      data: formattedAvenue,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<AvenueInterfaces.Response> {
    const methodName: string = this.findOne.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const avenue = await this.prisma.avenue.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        AvenueTranslations: {
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
        AvenueNewNameTranslations: {
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
        AvenueOldNameTranslations: {
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
    if (!avenue) {
      throw new NotFoundException('Avenue is not found');
    }
    const name = formatLanguageResponse(avenue.AvenueTranslations);
    const nameNew = formatLanguageResponse(avenue.AvenueNewNameTranslations);
    const nameOld = formatLanguageResponse(avenue.AvenueOldNameTranslations);
    delete avenue.AvenueNewNameTranslations;
    delete avenue.AvenueOldNameTranslations;
    delete avenue.AvenueTranslations;

    const regionTranslations = avenue.region.RegionTranslations;
    const regionName = formatLanguageResponse(regionTranslations);
    delete avenue.region.RegionTranslations;
    const region = { ...avenue.region, name: regionName };
    delete avenue.region;

    const cityTranslations = avenue.city.CityTranslations;
    const cityName = formatLanguageResponse(cityTranslations);
    delete avenue.city.CityTranslations;
    const city = { ...avenue.city, name: cityName };
    delete avenue.city;

    const districtData = avenue?.district;
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
      ...avenue.district,
      name: districtName,
      districtNameNew,
      districtNameOld,
    };
    delete avenue.district;
    this.logger.debug(`Method: ${methodName} - Response: `, avenue);

    return {
      ...avenue,
      name,
      newName: nameNew,
      oldName: nameOld,
      region,
      city,
      district,
    };
  }

  async update(data: AvenueUpdateDto): Promise<AvenueInterfaces.Response> {
    const methodName: string = this.update.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const avenue = await this.findOne({ id: data.id });

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

    const updateAvenue = await this.prisma.avenue.update({
      where: {
        id: avenue.id,
      },
      data: {
        regionId: data.regionId || avenue.regionId,
        cityId: data.cityId || avenue.cityId,
        districtId: data.districtId || null,
           editedStaffNumber: data.staffNumber ,
        index: data.index || avenue.index,
        orderNumber: data.orderNumber,
        AvenueTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
        AvenueNewNameTranslations: {
          updateMany:
            translationNewNameUpdates.length > 0
              ? translationNewNameUpdates
              : undefined,
        },
        AvenueOldNameTranslations: {
          updateMany:
            translationOldNameUpdates.length > 0
              ? translationOldNameUpdates
              : undefined,
        },
      },
      include: {
        AvenueTranslations: true,
        AvenueNewNameTranslations: true,
        AvenueOldNameTranslations: true,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updateAvenue);

    return updateAvenue;
  }

  async remove(data: DeleteDto): Promise<AvenueInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.delete) {
      const avenue = await this.prisma.avenue.delete({
        where: { id: data.id },
        include: {
          AvenueTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          AvenueNewNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          AvenueOldNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });

      this.logger.debug(
        `Method: ${methodName} - Rresponse when delete true: `,
        avenue
      );
      return avenue;
    }

    const avenueUpdate = await this.prisma.avenue.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        AvenueTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AvenueNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AvenueOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    this.logger.debug(
      `Method: ${methodName} - Rresponse when delete false: `,
      avenueUpdate
    );
    return avenueUpdate;
  }

  async restore(data: GetOneDto): Promise<AvenueInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const avenueUpdate = await this.prisma.avenue.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        AvenueTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AvenueNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        AvenueOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
    this.logger.debug(`Method: ${methodName} - Rresponse: `, avenueUpdate);
    return avenueUpdate;
  }
}
