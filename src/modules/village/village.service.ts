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
import { VillageCreateDto, VillageInterfaces, VillageUpdateDto } from 'types/organization/village';

@Injectable()
export class VillageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService,
  ) { }

  async create(
    data: VillageCreateDto
  ): Promise<VillageInterfaces.Response> {
    const region = await this.regionService.findOne({
      id: data.regionId,
    });
    const city = await this.cityService.findOne({
      id: data.cityId,
    });
    const district = await this.districtService.findOne({
      id: data.districtId,
    });
    const village = await this.prisma.village.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        districtId: district.id,
        index: data.index,
        staffId: data.staffId,
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
        VillageNewNameTranslations: {
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
        VillageOldNameTranslations: {
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
        }
      },
      include: {
        VillageTranslations: true,
        VillageNewNameTranslations: true,
        VillageOldNameTranslations: true,
      },
    });
    return village;
  }

  async findAll(
    data: LanguageRequestDto
  ): Promise<VillageInterfaces.ResponseWithoutPagination> {
    const villages = await this.prisma.village.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        VillageTranslations: {
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
        VillageOldNameTranslations: {
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
        VillageNewNameTranslations: {
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

    const formattedVillage = [];

    for (let i = 0; i < villages.length; i++) {
      const villageData = villages[i];
      const translations = villageData.VillageTranslations;
      const name = formatLanguageResponse(translations);
      const translationsNew = villageData.VillageNewNameTranslations;
      const nameNew = formatLanguageResponse(translationsNew);
      const translationsOld = villageData.VillageOldNameTranslations;
      const nameOld = formatLanguageResponse(translationsOld);
      delete villageData.VillageTranslations;
      delete villageData.VillageNewNameTranslations;
      delete villageData.VillageOldNameTranslations;

      formattedVillage.push({
        ...villageData,
        name,
        new_name: nameNew,
        old_name: nameOld,
      });
    }
    return {
      data: formattedVillage,
      totalDocs: villages.length,
    };
  }

  async findAllByPagination(
    data: ListQueryDto
  ): Promise<VillageInterfaces.ResponseWithPagination> {
    const where: any = { status: DefaultStatus.ACTIVE };
    if (data.search) {
      where.VillageTranslations = {
        some: {
          languageCode: data.lang_code,
          name: {
            contains: data.search,
          },
        },
      };
    }

    const count = await this.prisma.village.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const villages = await this.prisma.village.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        VillageTranslations: {
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
        VillageNewNameTranslations: {
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
        VillageOldNameTranslations: {
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

    const formattedVillage = [];

    for (let i = 0; i < villages.length; i++) {
      const villageData = villages[i];
      const translations = villageData.VillageTranslations;
      const name = formatLanguageResponse(translations);
      const translationsNew = villageData.VillageNewNameTranslations;
      const nameNew = formatLanguageResponse(translationsNew);
      const translationsOld = villageData.VillageOldNameTranslations;
      const nameOld = formatLanguageResponse(translationsOld);

      delete villageData.VillageTranslations;
      delete villageData.VillageNewNameTranslations;
      delete villageData.VillageOldNameTranslations;

      formattedVillage.push({
        ...villageData,
        name,
        new_name: nameNew,
        old_name: nameOld,
      });
    }

    return {
      data: formattedVillage,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<VillageInterfaces.Response> {
    const village = await this.prisma.village.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        VillageTranslations: {
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
        VillageNewNameTranslations: {
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
        VillageOldNameTranslations: {
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

    if (!village) {
      throw new NotFoundException('Village is not found');
    }
    const name = formatLanguageResponse(village.VillageTranslations);
    const nameNew = formatLanguageResponse(
      village.VillageNewNameTranslations
    );
    const nameOld = formatLanguageResponse(
      village.VillageOldNameTranslations
    );
    return { ...village, name, new_name: nameNew, old_name: nameOld };
  }

  async update(data: VillageUpdateDto): Promise<VillageInterfaces.Response> {
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

    return await this.prisma.village.update({
      where: {
        id: village.id,
      },
      data: {
        regionId: data.regionId || village.regionId,
        cityId: data.cityId || village.cityId,
        districtId: data.districtId || village.districtId,
        staffId: data.staffId || village.staffId,
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
  }

  async remove(data: DeleteDto): Promise<VillageInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.village.delete({
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
    }

    return await this.prisma.village.update({
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
  }

  async restore(data: GetOneDto): Promise<VillageInterfaces.Response> {
    return this.prisma.village.update({
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
  }
}
