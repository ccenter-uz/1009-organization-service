import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
    const district = await this.districtService.findOne({
      id: data.districtId,
    });
    const lane = await this.prisma.lane.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        districtId: district.id,
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
        LaneNewNameTranslations: {
          create: [
            {
              languageCode: LanguageRequestEnum.RU,
              name: data.new_name[LanguageRequestEnum.RU],
            },
            {
              languageCode: LanguageRequestEnum.UZ,
              name: data.new_name[LanguageRequestEnum.UZ],
            },
            {
              languageCode: LanguageRequestEnum.CY,
              name: data.new_name[LanguageRequestEnum.CY],
            },
          ],
        },
        LaneOldNameTranslations: {
          create: [
            {
              languageCode: LanguageRequestEnum.RU,
              name: data.old_name[LanguageRequestEnum.RU],
            },
            {
              languageCode: LanguageRequestEnum.UZ,
              name: data.old_name[LanguageRequestEnum.UZ],
            },
            {
              languageCode: LanguageRequestEnum.CY,
              name: data.old_name[LanguageRequestEnum.CY],
            },
          ],
        },
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
          LaneOldNameTranslations: {
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
          LaneNewNameTranslations: {
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

        formattedLane.push({
          ...laneData,
          name,
          new_name: nameNew,
          old_name: nameOld,
        });
      }

      return {
        data: formattedLane,
        totalDocs: lanes.length,
        totalPage: 1,
      };
    }

    const where: any = {
      ...(data.all_lang
        ? {}
        : {
            languageCode: data.lang_code,
          }),
      ...(data.status == 2
        ? {}
        : {
            status: data.status,
          }),
    };
    if (data.search) {
      where.LaneTranslations = {
        some: {
          languageCode: data.lang_code,
          name: {
            contains: data.search,
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
        LaneNewNameTranslations: {
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
        LaneOldNameTranslations: {
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

      formattedLane.push({
        ...laneData,
        name,
        new_name: nameNew,
        old_name: nameOld,
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
        LaneNewNameTranslations: {
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
        LaneOldNameTranslations: {
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
    if (!lane) {
      throw new NotFoundException('Lane is not found');
    }
    const name = formatLanguageResponse(lane.LaneTranslations);
    const nameNew = formatLanguageResponse(lane.LaneNewNameTranslations);
    const nameOld = formatLanguageResponse(lane.LaneOldNameTranslations);
    return { ...lane, name, new_name: nameNew, old_name: nameOld };
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

    if (data.new_name?.[LanguageRequestEnum.RU]) {
      translationNewNameUpdates.push({
        where: { languageCode: LanguageRequestEnum.RU },
        data: { name: data.new_name[LanguageRequestEnum.RU] },
      });
    }

    if (data.new_name?.[LanguageRequestEnum.UZ]) {
      translationNewNameUpdates.push({
        where: { languageCode: LanguageRequestEnum.UZ },
        data: { name: data.new_name[LanguageRequestEnum.UZ] },
      });
    }

    if (data.new_name?.[LanguageRequestEnum.CY]) {
      translationNewNameUpdates.push({
        where: { languageCode: LanguageRequestEnum.CY },
        data: { name: data.new_name[LanguageRequestEnum.CY] },
      });
    }

    if (data.old_name?.[LanguageRequestEnum.RU]) {
      translationOldNameUpdates.push({
        where: { languageCode: LanguageRequestEnum.RU },
        data: { name: data.old_name[LanguageRequestEnum.RU] },
      });
    }

    if (data.old_name?.[LanguageRequestEnum.UZ]) {
      translationOldNameUpdates.push({
        where: { languageCode: LanguageRequestEnum.UZ },
        data: { name: data.old_name[LanguageRequestEnum.UZ] },
      });
    }

    if (data.old_name?.[LanguageRequestEnum.CY]) {
      translationOldNameUpdates.push({
        where: { languageCode: LanguageRequestEnum.CY },
        data: { name: data.old_name[LanguageRequestEnum.CY] },
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
