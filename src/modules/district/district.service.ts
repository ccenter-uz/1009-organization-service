import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DistrictCreateDto,
  DistrictUpdateDto,
  DistrictInterfaces,
} from 'types/organization/district';
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
@Injectable()
export class DistrictService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService
  ) { }

  async create(data: DistrictCreateDto): Promise<DistrictInterfaces.Response> {
    const region = await this.regionService.findOne({
      id: data.regionId,
    });

    const city = await this.cityService.findOne({
      id: data.cityId,
    });
    const district = await this.prisma.district.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        index: data.index,
        staffNumber: data.staffNumber,
        DistrictTranslations: {
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
        DistrictNewNameTranslations: {
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
        DistrictOldNameTranslations: {
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
        DistrictTranslations: true,
        DistrictNewNameTranslations: true,
        DistrictOldNameTranslations: true,
      },
    });
    return district;
  }

  async findAll(
    data: LanguageRequestDto
  ): Promise<DistrictInterfaces.ResponseWithoutPagination> {
    const district = await this.prisma.district.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        DistrictTranslations: {
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
        DistrictNewNameTranslations: {
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
        DistrictOldNameTranslations: {
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

    const formattedDistrict = [];

    for (let i = 0; i < district.length; i++) {
      const districtData = district[i];
      const translations = districtData.DistrictTranslations;
      const name = formatLanguageResponse(translations);
      const translationsNew = districtData.DistrictNewNameTranslations;
      const nameNew = formatLanguageResponse(translationsNew);
      const translationsOld = districtData.DistrictOldNameTranslations;
      const nameOld = formatLanguageResponse(translationsOld);
      delete districtData.DistrictTranslations;
      delete districtData.DistrictNewNameTranslations;
      delete districtData.DistrictOldNameTranslations;

      formattedDistrict.push({
        ...districtData,
        name,
        new_name: nameNew,
        old_name: nameOld,
      });
    }

    return {
      data: formattedDistrict,
      totalDocs: district.length,
    };
  }

  async findAllByPagination(
    data: ListQueryDto
  ): Promise<DistrictInterfaces.ResponseWithPagination> {
    const where: any = { status: DefaultStatus.ACTIVE };
    if (data.search) {
      where.DistrictTranslations = {
        some: {
          languageCode: data.lang_code,
          name: {
            contains: data.search,
          },
        },
      };
    }
    const count = await this.prisma.district.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const district = await this.prisma.district.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        DistrictTranslations: {
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
        DistrictNewNameTranslations: {
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
        DistrictOldNameTranslations: {
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

    const formattedDistrict = [];

    for (let i = 0; i < district.length; i++) {
      const districtData = district[i];
      const translations = districtData.DistrictTranslations;
      const name = formatLanguageResponse(translations);
      const translationsNew = districtData.DistrictNewNameTranslations;
      const nameNew = formatLanguageResponse(translationsNew);
      const translationsOld = districtData.DistrictOldNameTranslations;
      const nameOld = formatLanguageResponse(translationsOld);

      delete districtData.DistrictTranslations;
      delete districtData.DistrictNewNameTranslations;
      delete districtData.DistrictOldNameTranslations;

      formattedDistrict.push({
        ...districtData,
        name,
        new_name: nameNew,
        old_name: nameOld,
      });
    }

    return {
      data: formattedDistrict,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<DistrictInterfaces.Response> {
    const district = await this.prisma.district.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        DistrictTranslations: {
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
        DistrictNewNameTranslations: {
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
        DistrictOldNameTranslations: {
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
    if (!district) {
      throw new NotFoundException('District is not found');
    }
    const name = formatLanguageResponse(district.DistrictTranslations);
    const nameNew = formatLanguageResponse(
      district.DistrictNewNameTranslations
    );
    const nameOld = formatLanguageResponse(
      district.DistrictOldNameTranslations
    );
    return { ...district, name, new_name: nameNew, old_name: nameOld };
  }

  async update(data: DistrictUpdateDto): Promise<DistrictInterfaces.Response> {
    const district = await this.findOne({ id: data.id });

    if (data.regionId) {
      await this.regionService.findOne({ id: data.regionId });
    }

    if (data.cityId) {
      await this.cityService.findOne({ id: data.cityId });
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

    return await this.prisma.district.update({
      where: {
        id: district.id,
      },
      data: {
        regionId: data.regionId || district.regionId,
        cityId: data.cityId || district.cityId,
        staffNumber: data.staffNumber || district.staffNumber,
        DistrictTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
        DistrictNewNameTranslations: {
          updateMany:
            translationNewNameUpdates.length > 0
              ? translationNewNameUpdates
              : undefined,
        },
        DistrictOldNameTranslations: {
          updateMany:
            translationOldNameUpdates.length > 0
              ? translationOldNameUpdates
              : undefined,
        },
      },
      include: {
        DistrictTranslations: true,
        DistrictNewNameTranslations: true,
        DistrictOldNameTranslations: true,
      },
    });
  }

  async remove(data: DeleteDto): Promise<DistrictInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.district.delete({
        where: { id: data.id },
        include: {
          DistrictTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          DistrictNewNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          DistrictOldNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
    }

    return await this.prisma.district.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        DistrictTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        DistrictNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        DistrictOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }

  async restore(data: GetOneDto): Promise<DistrictInterfaces.Response> {
    return this.prisma.district.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        DistrictTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        DistrictNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        DistrictOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }
}
