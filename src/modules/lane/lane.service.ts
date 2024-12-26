import { Injectable, NotFoundException } from '@nestjs/common';
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
@Injectable()
export class LaneService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService
  ) {}

  async create(data: LaneCreateDto): Promise<LaneInterfaces.Response> {
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
    return lane;
  }

  async findAll(
    data: ListQueryDto
  ): Promise<LaneInterfaces.ResponseWithPagination> {
    if (data.all) {
      const lanes = await this.prisma.lane.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
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
        },
      });

      const formattedLane = [];

      for (let i = 0; i < lanes.length; i++) {
        const laneData = lanes[i];
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
        totalPage: 1,
      };
    }

    const where: any = {
      ...(data.status == 2
        ? {}
        : {
            status: data.status,
          }),
    };
    if (data.search) {
      where.LaneTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
            mode: 'insensitive',
          },
        },
      };
    }
    const count = await this.prisma.lane.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const lanes = await this.prisma.lane.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        LaneTranslations: {
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
        LaneNewNameTranslations: {
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
        LaneOldNameTranslations: {
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
      },
      take: pagination.take,
      skip: pagination.skip,
    });

    const formattedLane = [];

    for (let i = 0; i < lanes.length; i++) {
      const laneData = lanes[i];
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
    return { ...lane, name, newName: nameNew, oldName: nameOld, region, city };
  }

  async update(data: LaneUpdateDto): Promise<LaneInterfaces.Response> {
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

    return await this.prisma.lane.update({
      where: {
        id: lane.id,
      },
      data: {
        regionId: data.regionId || lane.regionId,
        cityId: data.cityId || lane.cityId,
        districtId: data.districtId || lane.districtId,
        staffNumber: data.staffNumber || lane.staffNumber,
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
  }

  async remove(data: DeleteDto): Promise<LaneInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.lane.delete({
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
    }

    return await this.prisma.lane.update({
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
  }

  async restore(data: GetOneDto): Promise<LaneInterfaces.Response> {
    return this.prisma.lane.update({
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
  }
}
