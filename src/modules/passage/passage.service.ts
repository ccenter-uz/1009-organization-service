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
  PassageCreateDto,
  PassageInterfaces,
  PassageUpdateDto,
} from 'types/organization/passage';
import { CityRegionFilterDto } from 'types/global-filters/city-region-filter';
import { getOrderedDataWithDistrict } from '@/common/helper/get-ordered-data-with-district';
import { Prisma } from '@prisma/client';
@Injectable()
export class PassageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService
  ) {}

  async create(data: PassageCreateDto): Promise<PassageInterfaces.Response> {
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
      names.PassageNewNameTranslations = {
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
      names.PassageOldNameTranslations = {
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

    const passage = await this.prisma.passage.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        ...(data.districtId ? { districtId: district.id } : {}),
        index: data.index,
        staffNumber: data.staffNumber,
        PassageTranslations: {
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
        PassageTranslations: true,
        PassageNewNameTranslations: true,
        PassageOldNameTranslations: true,
      },
    });
    return passage;
  }

  async findAll(
    data: CityRegionFilterDto
  ): Promise<PassageInterfaces.ResponseWithPagination> {
    const conditions: Prisma.Sql[] = [];
    if (data.status === 0 || data.status === 1)
      conditions.push(Prisma.sql`c.status = ${data.status}`);
    if (data.cityId) conditions.push(Prisma.sql`c.city_id = ${data.cityId}`);
    if (data.regionId)
      conditions.push(Prisma.sql`c.region_id = ${data.regionId}`);
    if (data.search) {
      if (data.langCode) {
        conditions.push(Prisma.sql`
                EXISTS (
                  SELECT 1
                  FROM passage_translations ct
                  WHERE ct.passage_id = c.id
                    AND ct.language_code = ${data.langCode}
                    AND ct.name ILIKE ${`%${data.search}%`}
                )
              `);
      } else {
        conditions.push(Prisma.sql`
                EXISTS (
                  SELECT 1
                  FROM passage_translations ct
                  WHERE ct.passage_id = c.id
                    AND ct.name ILIKE ${`%${data.search}%`}
                  ORDER BY ct.language_code   
                  LIMIT 1
                )
              `);
      }
    }
    if (data.all) {
      let passages = await getOrderedDataWithDistrict(
        'Passage',
        'passage',
        this.prisma,
        data,
        conditions
      );

      const formattedPassage = [];

      for (let i = 0; i < passages.length; i++) {
        const passageData = passages[i];
        const translations = passageData.PassageTranslations;
        const name = formatLanguageResponse(translations);
        const translationsNew = passageData.PassageNewNameTranslations;
        const nameNew = formatLanguageResponse(translationsNew);
        const translationsOld = passageData.PassageOldNameTranslations;
        const nameOld = formatLanguageResponse(translationsOld);
        delete passageData.PassageTranslations;
        delete passageData.PassageNewNameTranslations;
        delete passageData.PassageOldNameTranslations;

        const regionTranslations = passageData.region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete passageData.region.RegionTranslations;
        const region = { ...passageData.region, name: regionName };
        delete passageData.region;

        const cityTranslations = passageData.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete passageData.city.CityTranslations;
        const city = { ...passageData.city, name: cityName };
        delete passageData.city;

        const districtData = passageData?.district;
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
          ...passageData.district,
          name: districtName,
          districtNameNew,
          districtNameOld,
        };
        delete passageData.district;

        formattedPassage.push({
          ...passageData,
          name,
          newName: nameNew,
          oldName: nameOld,
          region,
          city,
          district,
        });
      }

      return {
        data: formattedPassage,
        totalDocs: passages.length,
        totalPage: 1,
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
    };
    if (data.search) {
      where.PassageTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
            mode: 'insensitive',
          },
        },
      };
    }
    const count = await this.prisma.passage.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    let passages = await getOrderedDataWithDistrict(
      'Passage',
      'passage',
      this.prisma,
      data,
      conditions
    );

    const formattedPassage = [];

    for (let i = 0; i < passages.length; i++) {
      const passageData = passages[i];
      const translations = passageData.PassageTranslations;
      const name = formatLanguageResponse(translations);
      const translationsNew = passageData.PassageNewNameTranslations;
      const nameNew = formatLanguageResponse(translationsNew);
      const translationsOld = passageData.PassageOldNameTranslations;
      const nameOld = formatLanguageResponse(translationsOld);

      delete passageData.PassageTranslations;
      delete passageData.PassageNewNameTranslations;
      delete passageData.PassageOldNameTranslations;

      const regionTranslations = passageData.region.RegionTranslations;
      const regionName = formatLanguageResponse(regionTranslations);
      delete passageData.region.RegionTranslations;
      const region = { ...passageData.region, name: regionName };
      delete passageData.region;

      const cityTranslations = passageData.city.CityTranslations;
      const cityName = formatLanguageResponse(cityTranslations);
      delete passageData.city.CityTranslations;
      const city = { ...passageData.city, name: cityName };
      delete passageData.city;

      const districtData = passageData?.district;
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
        ...passageData.district,
        name: districtName,
        districtNameNew,
        districtNameOld,
      };
      delete passageData.district;

      formattedPassage.push({
        ...passageData,
        name,
        newName: nameNew,
        oldName: nameOld,
        region,
        city,
        district,
      });
    }

    return {
      data: formattedPassage,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<PassageInterfaces.Response> {
    const passage = await this.prisma.passage.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        PassageTranslations: {
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
        PassageNewNameTranslations: {
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
        PassageOldNameTranslations: {
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
    if (!passage) {
      throw new NotFoundException('Passage is not found');
    }
    const name = formatLanguageResponse(passage.PassageTranslations);
    const nameNew = formatLanguageResponse(passage.PassageNewNameTranslations);
    const nameOld = formatLanguageResponse(passage.PassageOldNameTranslations);
    delete passage.PassageNewNameTranslations;
    delete passage.PassageOldNameTranslations;
    delete passage.PassageTranslations;

    const regionTranslations = passage.region.RegionTranslations;
    const regionName = formatLanguageResponse(regionTranslations);
    delete passage.region.RegionTranslations;
    const region = { ...passage.region, name: regionName };
    delete passage.region;

    const cityTranslations = passage.city.CityTranslations;
    const cityName = formatLanguageResponse(cityTranslations);
    delete passage.city.CityTranslations;
    const city = { ...passage.city, name: cityName };
    delete passage.city;

    const districtData = passage?.district;
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
      ...passage.district,
      name: districtName,
      districtNameNew,
      districtNameOld,
    };
    delete passage.district;

    return {
      ...passage,
      name,
      newName: nameNew,
      oldName: nameOld,
      region,
      city,
      district,
    };
  }

  async update(data: PassageUpdateDto): Promise<PassageInterfaces.Response> {
    const passage = await this.findOne({ id: data.id });

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

    return await this.prisma.passage.update({
      where: {
        id: passage.id,
      },
      data: {
        regionId: data.regionId || passage.regionId,
        cityId: data.cityId || passage.cityId,
        districtId: data.districtId || null,
        staffNumber: data.staffNumber || passage.staffNumber,
        index: data.index || passage.index,
        PassageTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
        PassageNewNameTranslations: {
          updateMany:
            translationNewNameUpdates.length > 0
              ? translationNewNameUpdates
              : undefined,
        },
        PassageOldNameTranslations: {
          updateMany:
            translationOldNameUpdates.length > 0
              ? translationOldNameUpdates
              : undefined,
        },
      },
      include: {
        PassageTranslations: true,
        PassageNewNameTranslations: true,
        PassageOldNameTranslations: true,
      },
    });
  }

  async remove(data: DeleteDto): Promise<PassageInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.passage.delete({
        where: { id: data.id },
        include: {
          PassageTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          PassageNewNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          PassageOldNameTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
    }

    return await this.prisma.passage.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        PassageTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        PassageNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        PassageOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }

  async restore(data: GetOneDto): Promise<PassageInterfaces.Response> {
    return this.prisma.passage.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        PassageTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        PassageNewNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        PassageOldNameTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }
}
