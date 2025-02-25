import { Injectable, NotFoundException, Logger } from '@nestjs/common';
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
  LaneCreateDto,
  LaneInterfaces,
  LaneUpdateDto,
} from 'types/organization/lane';
import { CityRegionFilterDto } from 'types/global/dto/city-region-filter.dto';
import { getOrderedDataWithDistrict } from '@/common/helper/sql-rows-for-select/get-ordered-data-with-district.dto';
@Injectable()
export class LaneService {
  private logger = new Logger(LaneService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService
  ) {}

  async create(data: LaneCreateDto): Promise<LaneInterfaces.Response> {
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
      names.LaneNewNameTranslations = {
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
      names.LaneOldNameTranslations = {
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

    const lane = await this.prisma.lane.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        ...(data.districtId ? { districtId: district.id } : {}),
        index: data.index,
        staffNumber: data.staffNumber,
        orderNumber: data.orderNumber,
        LaneTranslations: {
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
        LaneTranslations: true,
        LaneNewNameTranslations: true,
        LaneOldNameTranslations: true,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, lane);

    return lane;
  }

  async findAll(
    data: CityRegionFilterDto
  ): Promise<LaneInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.all) {
      const lanes = await getOrderedDataWithDistrict(
        'Lane',
        'lane',
        this.prisma,
        data
      );

      const formattedLane = [];

      for (let i = 0; i < lanes.length; i++) {
        let laneData = lanes[i];
        const translations = laneData.LaneTranslations;
        const name = formatLanguageResponse(translations);
        const translationsNew = laneData.LaneNewNameTranslations;
        const nameNew = formatLanguageResponse(translationsNew);
        const translationsOld = laneData.LaneOldNameTranslations;
        const nameOld = formatLanguageResponse(translationsOld);
        delete laneData.LaneTranslations;
        delete laneData.LaneNewNameTranslations;
        delete laneData.LaneOldNameTranslations;

        const regionTranslations = laneData.region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete laneData.region.RegionTranslations;
        const region = { ...laneData.region, name: regionName };
        delete laneData.region;

        const cityTranslations = laneData.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete laneData.city.CityTranslations;
        const city = { ...laneData.city, name: cityName };
        delete laneData.city;
        if (laneData?.district) {
          const districtData = laneData?.district;
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
          laneData = {
            ...laneData,
            district,
          };
        }
        this.logger.debug(`Method: ${methodName} -  Response: `, laneData);

        formattedLane.push({
          ...laneData,
          name,
          newName: nameNew,
          oldName: nameOld,
          region,
          city,
        });
      }

      return {
        data: formattedLane,
        totalDocs: lanes.length,
        totalPage: lanes.length > 0 ? 1 : 0,
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
          LaneTranslations: {
            some: {
              name: {
                contains: data.search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          LaneNewNameTranslations: {
            some: {
              name: {
                contains: data.search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          LaneOldNameTranslations: {
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
    const count = await this.prisma.lane.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const lanes = await getOrderedDataWithDistrict(
      'Lane',
      'lane',
      this.prisma,
      data,
      pagination
    );

    const formattedLane = [];

    for (let i = 0; i < lanes.length; i++) {
      let laneData = lanes[i];
      const translations = laneData.LaneTranslations;
      const name = formatLanguageResponse(translations);
      const translationsNew = laneData.LaneNewNameTranslations;
      const nameNew = formatLanguageResponse(translationsNew);
      const translationsOld = laneData.LaneOldNameTranslations;
      const nameOld = formatLanguageResponse(translationsOld);

      delete laneData.LaneTranslations;
      delete laneData.LaneNewNameTranslations;
      delete laneData.LaneOldNameTranslations;

      const regionTranslations = laneData.region.RegionTranslations;
      const regionName = formatLanguageResponse(regionTranslations);
      delete laneData.region.RegionTranslations;
      const region = { ...laneData.region, name: regionName };
      delete laneData.region;

      const cityTranslations = laneData.city.CityTranslations;
      const cityName = formatLanguageResponse(cityTranslations);
      delete laneData.city.CityTranslations;
      const city = { ...laneData.city, name: cityName };
      delete laneData.city;
      if (laneData?.district) {
        const districtData = laneData?.district;
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
        laneData = {
          ...laneData,
          district,
        };
      }
      this.logger.debug(`Method: ${methodName} - Response: `, laneData);

      formattedLane.push({
        ...laneData,
        name,
        newName: nameNew,
        oldName: nameOld,
        region,
        city,
      });
    }

    return {
      data: formattedLane,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<LaneInterfaces.Response> {
    const methodName: string = this.findOne.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const lane = await this.prisma.lane.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        LaneTranslations: {
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
        LaneNewNameTranslations: {
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
        LaneOldNameTranslations: {
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
    if (!lane) {
      throw new NotFoundException('Lane is not found');
    }
    const name = formatLanguageResponse(lane.LaneTranslations);
    const nameNew = formatLanguageResponse(lane.LaneNewNameTranslations);
    const nameOld = formatLanguageResponse(lane.LaneOldNameTranslations);
    delete lane.LaneNewNameTranslations;
    delete lane.LaneOldNameTranslations;
    delete lane.LaneTranslations;

    const regionTranslations = lane.region.RegionTranslations;
    const regionName = formatLanguageResponse(regionTranslations);
    delete lane.region.RegionTranslations;
    const region = { ...lane.region, name: regionName };
    delete lane.region;

    const cityTranslations = lane.city.CityTranslations;
    const cityName = formatLanguageResponse(cityTranslations);
    delete lane.city.CityTranslations;
    const city = { ...lane.city, name: cityName };
    delete lane.city;

    const districtData = lane?.district;
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

    this.logger.debug(`Method: ${methodName} - Response: `, lane);

    return {
      ...lane,
      name,
      newName: nameNew,
      oldName: nameOld,
      region,
      city,
      district,
    };
  }

  async update(data: LaneUpdateDto): Promise<LaneInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const lane = await this.findOne({ id: data.id });

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

    const updatedLane = await this.prisma.lane.update({
      where: {
        id: lane.id,
      },
      data: {
        regionId: data.regionId || lane.regionId,
        cityId: data.cityId || lane.cityId,
        districtId: data.districtId || null,
        staffNumber: data.staffNumber || lane.staffNumber,
        orderNumber: data.orderNumber,
        index: data.index || lane.index,
        LaneTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
        LaneNewNameTranslations: {
          updateMany:
            translationNewNameUpdates.length > 0
              ? translationNewNameUpdates
              : undefined,
        },
        LaneOldNameTranslations: {
          updateMany:
            translationOldNameUpdates.length > 0
              ? translationOldNameUpdates
              : undefined,
        },
      },
      include: {
        LaneTranslations: true,
        LaneNewNameTranslations: true,
        LaneOldNameTranslations: true,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updatedLane);

    return updatedLane;
  }

  async remove(data: DeleteDto): Promise<LaneInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.delete) {
      const deletedLane = await this.prisma.lane.delete({
        where: { id: data.id },
        include: {
          LaneTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          LaneNewNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          LaneOldNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
      this.logger.debug(`Method: ${methodName} - Response: `, deletedLane);

      return deletedLane;
    }

    const updatedLane = await this.prisma.lane.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        LaneTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        LaneNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        LaneOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updatedLane);

    return updatedLane;
  }

  async restore(data: GetOneDto): Promise<LaneInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const updatedLane = this.prisma.lane.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        LaneTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        LaneNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        LaneOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updatedLane);

    return updatedLane;
  }
}
