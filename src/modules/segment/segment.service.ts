import { Injectable, NotFoundException } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  LanguageRequestEnum,
  ListQueryDto,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import {
  SegmentCreateDto,
  SegmentInterfaces,
  SegmentUpdateDto,
} from 'types/organization/segment';

@Injectable()
export class SegmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: SegmentCreateDto): Promise<SegmentInterfaces.Response> {
    const segment = await this.prisma.segment.create({
      data: {
        SegmentTranslations: {
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
        SegmentTranslations: true,
      },
    });
    return segment;
  }

  async findAll(
    data: ListQueryDto
  ): Promise<SegmentInterfaces.ResponseWithPagination> {
    if (data.all) {
      const segments = await this.prisma.segment.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
        },
        include: {
          SegmentTranslations: {
            where: data.all_lang
              ? {}
              : {
                  languageCode: data.lang_code, // lang_code from request
                },
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });

      const formattedSegment = segments.map((segment) => {
        const translations = segment.SegmentTranslations;

        const name = formatLanguageResponse(translations);
        delete segment.SegmentTranslations;

        return { ...segment, name };
      });

      return {
        data: formattedSegment,
        totalDocs: segments.length,
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
      where.SegmentTranslations = {
        some: {
          languageCode: data.lang_code,
          name: {
            contains: data.search,
          },
        },
      };
    }

    const count = await this.prisma.segment.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const categories = await this.prisma.segment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        SegmentTranslations: {
          where: data.all_lang
            ? {}
            : {
                languageCode: data.lang_code, // lang_code from request
              },
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
      take: pagination.take,
      skip: pagination.skip,
    });

    const formattedCategories = categories.map((segment) => {
      const translations = segment.SegmentTranslations;

      const name = formatLanguageResponse(translations);
      delete segment.SegmentTranslations;

      return { ...segment, name };
    });

    return {
      data: formattedCategories,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<SegmentInterfaces.Response> {
    const segment = await this.prisma.segment.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        SegmentTranslations: {
          where: data.all_lang
            ? {}
            : {
                languageCode: data.lang_code, // lang_code from request
              },
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });

    if (!segment) {
      throw new NotFoundException('Segment is not found');
    }

    const name = formatLanguageResponse(segment.SegmentTranslations);
    delete segment.SegmentTranslations;

    return { ...segment, name };
  }

  async update(data: SegmentUpdateDto): Promise<SegmentInterfaces.Response> {
    const category = await this.findOne({ id: data.id });

    return await this.prisma.segment.update({
      where: {
        id: category.id,
      },
      data: {
        SegmentTranslations: {
          updateMany: [
            {
              where: { languageCode: LanguageRequestEnum.RU },
              data: { name: data.name[LanguageRequestEnum.RU] },
            },
            {
              where: { languageCode: LanguageRequestEnum.UZ },
              data: { name: data.name[LanguageRequestEnum.UZ] },
            },
            {
              where: { languageCode: LanguageRequestEnum.CY },
              data: { name: data.name[LanguageRequestEnum.CY] },
            },
          ],
        },
      },
      include: {
        SegmentTranslations: true, // Include translations in the response
      },
    });
  }

  async remove(data: DeleteDto): Promise<SegmentInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.segment.delete({
        where: { id: data.id },
        include: {
          SegmentTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
    }

    return await this.prisma.segment.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        SegmentTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }

  async restore(data: GetOneDto): Promise<SegmentInterfaces.Response> {
    return this.prisma.segment.update({
      where: { id: data.id, status: DefaultStatus.INACTIVE },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        SegmentTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }
}
