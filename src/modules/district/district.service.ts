import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { DistrictFilterDto } from 'types/organization/district/dto/filter-district.dto';
import { Prisma } from '@prisma/client';
import { getDistrictData } from '@/common/helper/sql-rows-for-select/get-district-data.dto';
@Injectable()
export class DistrictService {
  private logger = new Logger(DistrictService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService
  ) {}

  async create(data: DistrictCreateDto): Promise<DistrictInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const region = await this.regionService.findOne({
      id: data.regionId,
    });

    const city = await this.cityService.findOne({
      id: data.cityId,
    });

    const names: any = {};

    if (data.newName) {
      names.DistrictNewNameTranslations = {
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
      names.DistrictOldNameTranslations = {
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

    const district = await this.prisma.district.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        index: data.index,
        staffNumber: data.staffNumber,
        orderNumber: data.orderNumber,
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
        ...names,
      },
      include: {
        DistrictTranslations: true,
        DistrictNewNameTranslations: true,
        DistrictOldNameTranslations: true,
        Region: {
          select: {
            RegionTranslations: true,
          },
        },
        City: {
          select: {
            CityTranslations: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, district);

    return district;
  }

  async findAll(
    data: DistrictFilterDto
  ): Promise<DistrictInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.all) {
      const district = await getDistrictData(
        'District',
        'district',
        this.prisma,
        data
      );
      

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

        const regionTranslations = districtData.Region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete districtData.Region.RegionTranslations;
        const region = { ...districtData.Region, name: regionName };
        delete districtData.Region;

        const cityTranslations = districtData.City.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete districtData.City.CityTranslations;
        const city = { ...districtData.City, name: cityName };
        delete districtData.City;

        formattedDistrict.push({
          ...districtData,
          name,
          newName: nameNew,
          oldName: nameOld,
          region,
          city,
        });
      }
      this.logger.debug(
        `Method: ${methodName} -  Response: `,
        formattedDistrict
      );

      return {
        data: formattedDistrict,
        totalDocs: district.length,
        totalPage: district.length > 0 ? 1 : 0,
      };
    }

    const where: any = {
      ...(data.status == 2
        ? {}
        : {
            status: data.status,
          }),
      regionId: data.regionId,
      cityId: data.cityId,
    };
    if (data.search) {
      where.OR = [
        {
          DistrictTranslations: {
            some: {
              name: {
                contains: data.search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          DistrictNewNameTranslations: {
            some: {
              name: {
                contains: data.search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          DistrictOldNameTranslations: {
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
    const count = await this.prisma.district.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const district = await getDistrictData(
      'District',
      'district',
      this.prisma,
      data,
      pagination
    );

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

      const regionTranslations = districtData.Region.RegionTranslations;
      const regionName = formatLanguageResponse(regionTranslations);
      delete districtData.Region.RegionTranslations;
      const region = { ...districtData.Region, name: regionName };
      delete districtData.Region;

      const cityTranslations = districtData.City.CityTranslations;
      const cityName = formatLanguageResponse(cityTranslations);
      delete districtData.City.CityTranslations;
      const city = { ...districtData.City, name: cityName };
      delete districtData.City;

      formattedDistrict.push({
        ...districtData,
        name,
        newName: nameNew,
        oldName: nameOld,
        region,
        city,
      });
    }
    this.logger.debug(`Method: ${methodName} - Response: `, formattedDistrict);

    return {
      data: formattedDistrict,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<DistrictInterfaces.Response> {
    const methodName: string = this.findOne.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const district = await this.prisma.district.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        Region: {
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
        City: {
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

    const regionTranslations = district.Region.RegionTranslations;
    const regionName = formatLanguageResponse(regionTranslations);
    delete district.Region.RegionTranslations;
    const region = { ...district.Region, name: regionName };
    delete district.Region;

    const cityTranslations = district.City.CityTranslations;
    const cityName = formatLanguageResponse(cityTranslations);
    delete district.City.CityTranslations;
    const city = { ...district.City, name: cityName };
    delete district.City;

    delete district.DistrictTranslations;
    delete district.DistrictNewNameTranslations;
    delete district.DistrictOldNameTranslations;
    this.logger.debug(`Method: ${methodName} - Response: `, district);

    return {
      ...district,
      name,
      newName: nameNew,
      oldName: nameOld,
      region,
      city,
    };
  }

  async update(data: DistrictUpdateDto): Promise<DistrictInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
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

    const updatedDistrict = await this.prisma.district.update({
      where: {
        id: district.id,
      },
      data: {
        regionId: data.regionId || district.regionId,
        cityId: data.cityId || district.cityId,
        editedStaffNumber: data.staffNumber,
        index: data.index || district.index,
        orderNumber: data.orderNumber,
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
        Region: {
          select: {
            RegionTranslations: true,
          },
        },
        City: {
          select: {
            CityTranslations: true,
          },
        },
      },
    });
    this.logger.debug(`Method: ${methodName} - Response: `, updatedDistrict);

    return updatedDistrict;
  }

  async remove(data: DeleteDto): Promise<DistrictInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.delete) {
      const deleteDistrict = await this.prisma.district.delete({
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
          Region: {
            select: {
              RegionTranslations: true,
            },
          },
          City: {
            select: {
              CityTranslations: true,
            },
          },
        },
      });

      this.logger.debug(`Method: ${methodName} - Response: `, deleteDistrict);

      return deleteDistrict;
    }

    const deleteDistrict = await this.prisma.district.update({
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
        Region: {
          select: {
            RegionTranslations: true,
          },
        },
        City: {
          select: {
            CityTranslations: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, deleteDistrict);

    return deleteDistrict;
  }

  async restore(data: GetOneDto): Promise<DistrictInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const updatedDistrict = this.prisma.district.update({
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
        Region: {
          select: {
            RegionTranslations: true,
          },
        },
        City: {
          select: {
            CityTranslations: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updatedDistrict);

    return updatedDistrict;
  }
}
