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
import { ImpasseCreateDto, ImpasseInterfaces, ImpasseUpdateDto } from 'types/organization/impasse';
@Injectable()
export class ImpasseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService,
  ) { }

  async create(
    data: ImpasseCreateDto
  ): Promise<ImpasseInterfaces.Response> {
    const region = await this.regionService.findOne({
      id: data.regionId,
    });
    const city = await this.cityService.findOne({
      id: data.cityId,
    });
    const district = await this.districtService.findOne({
      id: data.districtId,
    });
    const impasse = await this.prisma.impasse.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        districtId: district.id,
        index: data.index,
        staffNumber: data.staffNumber,
        ImpasseTranslations: {
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
        ImpasseNewNameTranslations: {
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
        ImpasseOldNameTranslations: {
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
        ImpasseTranslations: true,
        ImpasseNewNameTranslations: true,
        ImpasseOldNameTranslations: true,
      },
    });
    return impasse;
  }

  async findAll(
    data: LanguageRequestDto
  ): Promise<ImpasseInterfaces.ResponseWithoutPagination> {
    const impasses = await this.prisma.impasse.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        ImpasseTranslations: {
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
        ImpasseOldNameTranslations: {
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
        ImpasseNewNameTranslations: {
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

    const formattedImpasse = [];

    for (let i = 0; i < impasses.length; i++) {
      const impasseData = impasses[i];
      const translations = impasseData.ImpasseTranslations;
      const name = formatLanguageResponse(translations);
      const translationsNew = impasseData.ImpasseNewNameTranslations;
      const nameNew = formatLanguageResponse(translationsNew);
      const translationsOld = impasseData.ImpasseOldNameTranslations;
      const nameOld = formatLanguageResponse(translationsOld);
      delete impasseData.ImpasseTranslations;
      delete impasseData.ImpasseNewNameTranslations;
      delete impasseData.ImpasseOldNameTranslations;

      formattedImpasse.push({
        ...impasseData,
        name,
        new_name: nameNew,
        old_name: nameOld,
      });
    }

    return {
      data: formattedImpasse,
      totalDocs: impasses.length,
    };
  }

  async findAllByPagination(
    data: ListQueryDto
  ): Promise<ImpasseInterfaces.ResponseWithPagination> {
    const where: any = { status: DefaultStatus.ACTIVE };
    if (data.search) {
      where.ImpasseTranslations = {
        some: {
          languageCode: data.lang_code,
          name: {
            contains: data.search,
          },
        },
      };
    }
    const count = await this.prisma.impasse.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const impasses = await this.prisma.impasse.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        ImpasseTranslations: {
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
        ImpasseNewNameTranslations: {
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
        ImpasseOldNameTranslations: {
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

    const formattedImpasse = [];

    for (let i = 0; i < impasses.length; i++) {
      const impasseData = impasses[i];
      const translations = impasseData.ImpasseTranslations;
      const name = formatLanguageResponse(translations);
      const translationsNew = impasseData.ImpasseNewNameTranslations;
      const nameNew = formatLanguageResponse(translationsNew);
      const translationsOld = impasseData.ImpasseOldNameTranslations;
      const nameOld = formatLanguageResponse(translationsOld);

      delete impasseData.ImpasseTranslations;
      delete impasseData.ImpasseNewNameTranslations;
      delete impasseData.ImpasseOldNameTranslations;

      formattedImpasse.push({
        ...impasseData,
        name,
        new_name: nameNew,
        old_name: nameOld,
      });
    }

    return {
      data: formattedImpasse,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<ImpasseInterfaces.Response> {
    const impasse = await this.prisma.impasse.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        ImpasseTranslations: {
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
        ImpasseNewNameTranslations: {
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
        ImpasseOldNameTranslations: {
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
    if (!impasse) {
      throw new NotFoundException('Impasse is not found');
    }
    const name = formatLanguageResponse(impasse.ImpasseTranslations);
    const nameNew = formatLanguageResponse(
      impasse.ImpasseNewNameTranslations
    );
    const nameOld = formatLanguageResponse(
      impasse.ImpasseOldNameTranslations
    );
    return { ...impasse, name, new_name: nameNew, old_name: nameOld };
  }

  async update(data: ImpasseUpdateDto): Promise<ImpasseInterfaces.Response> {
    const impasse = await this.findOne({ id: data.id });

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

    return await this.prisma.impasse.update({
      where: {
        id: impasse.id,
      },
      data: {
        regionId: data.regionId || impasse.regionId,
        cityId: data.cityId || impasse.cityId,
        districtId: data.districtId || impasse.districtId,
        staffNumber: data.staffNumber || impasse.staffNumber,
        ImpasseTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
        ImpasseNewNameTranslations: {
          updateMany:
            translationNewNameUpdates.length > 0
              ? translationNewNameUpdates
              : undefined,
        },
        ImpasseOldNameTranslations: {
          updateMany:
            translationOldNameUpdates.length > 0
              ? translationOldNameUpdates
              : undefined,
        },
      },
      include: {
        ImpasseTranslations: true,
        ImpasseNewNameTranslations: true,
        ImpasseOldNameTranslations: true,
      },
    });
  }

  async remove(data: DeleteDto): Promise<ImpasseInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.impasse.delete({
        where: { id: data.id },
        include: {
          ImpasseTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          ImpasseNewNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          ImpasseOldNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
    }

    return await this.prisma.impasse.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        ImpasseTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        ImpasseNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        ImpasseOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }

  async restore(data: GetOneDto): Promise<ImpasseInterfaces.Response> {
    return this.prisma.impasse.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        ImpasseTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        ImpasseNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        ImpasseOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }
}
