import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  RegionCreateDto,
  RegionInterfaces,
  RegionUpdateDto,
} from 'types/organization/region';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestEnum,
  ListQueryDto,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { Prisma } from '@prisma/client';
import { getSingleData } from '@/common/helper/sql-rows-for-select/get-single-data.dto';

@Injectable()
export class RegionService {
  private logger = new Logger(RegionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: RegionCreateDto): Promise<RegionInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const region = await this.prisma.region.create({
      data: {
        RegionTranslations: {
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
      },
      include: {
        RegionTranslations: true,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, region);

    await this.prisma.$executeRawUnsafe(`
      UPDATE region_translations 
      SET search_vector = to_tsvector('simple', name) 
      WHERE region_id = ${region.id}
    `);

    this.logger.debug(
      `Method: ${methodName} - Updating translation for tsvector`
    );

    return region;
  }

  async findAll(
    data: ListQueryDto
  ): Promise<RegionInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const conditions: Prisma.Sql[] = [];
    if (data.status === 0 || data.status === 1)
      conditions.push(Prisma.sql`c.status = ${data.status}`);
    if (data.search) {
      conditions.push(Prisma.sql`
              EXISTS (
                SELECT 1
                FROM region_translations ct
                WHERE ct.region_id = c.id
                  AND ct.name ILIKE ${`%${data.search}%`}
                ORDER BY ct.language_code   
                LIMIT 1
              )
            `);
    }
    if (data.all) {
      const regions = await getSingleData(
        'Region',
        'region',
        this.prisma,
        data,
        conditions
      );


      this.logger.debug(`Method: ${methodName} - Response: `, regions);

      return {
        data: regions,
        totalDocs: regions.length,
        totalPage: regions.length > 0 ? 1 : 0,
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
      where.RegionTranslations = {
        some: {
          name: {
            contains: data.search,
            mode: 'insensitive',
          },
        },
      };
    }
    const count = await this.prisma.region.count({ where });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const regions = await getSingleData(
      'Region',
      'region',
      this.prisma,
      data,
      conditions,
      pagination
    );


    this.logger.debug(
      `Method: ${methodName} - Response: `,
      regions
    );
    return {
      data: regions,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<RegionInterfaces.Response> {
    const methodName: string = this.findOne.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const region = await this.prisma.region.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
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
    });
    if (!region) {
      throw new NotFoundException('Region is not found');
    }
    const name = formatLanguageResponse(region.RegionTranslations);
    this.logger.debug(`Method: ${methodName} - Response: `, region);

    return { ...region, name };
  }

  async update(data: RegionUpdateDto): Promise<RegionInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const region = await this.findOne({ id: data.id });

    const translationUpdates = [];

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

    const updateRegion = await this.prisma.region.update({
      where: {
        id: region.id,
      },
      data: {
        RegionTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
      },
      include: {
        RegionTranslations: true,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updateRegion);

    return updateRegion;
  }

  async remove(data: DeleteDto): Promise<RegionInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.delete) {
      const updateRegion = await this.prisma.region.delete({
        where: { id: data.id },
        include: {
          RegionTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });

      this.logger.debug(`Method: ${methodName} - Response: `, updateRegion);

      return updateRegion;
    }

    const updateRegion = await this.prisma.region.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        RegionTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updateRegion);

    return updateRegion;
  }

  async restore(data: GetOneDto): Promise<RegionInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const updateRegion = this.prisma.region.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        RegionTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
    this.logger.debug(`Method: ${methodName} - Response: `, updateRegion);

    return updateRegion;
  }
}
