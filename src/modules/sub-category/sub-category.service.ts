import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  SubCategoryCreateDto,
  SubCategoryFilterDto,
  SubCategoryInterfaces,
  SubCategoryUpdateDto,
} from 'types/organization/sub-category';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestEnum,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { createPagination } from '@/common/helper/pagination.helper';
import { CategoryService } from '../category/category.service';
@Injectable()
export class SubCategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryService: CategoryService
  ) {}

  async create(
    data: SubCategoryCreateDto
  ): Promise<SubCategoryInterfaces.Response> {
    const category = await this.categoryService.findOne({
      id: data.categoryId,
    });
    const subCategory = await this.prisma.subCategory.create({
      data: {
        staffNumber: data.staffNumber,
        categoryId: category.id,
        SubCategoryTranslations: {
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
        category: true,
        SubCategoryTranslations: true,
      },
    });
    return subCategory;
  }

  async findAll(
    data: SubCategoryFilterDto
  ): Promise<SubCategoryInterfaces.ResponseWithPagination> {
    if (data.all) {
      const subCategories = await this.prisma.subCategory.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          categoryId: data.categoryId,
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
        },
        include: {
          category: true,
          SubCategoryTranslations: {
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

      const formattedSubCategories = [];

      for (let i = 0; i < subCategories.length; i++) {
        const subCategory = subCategories[i];
        const translations = subCategory.SubCategoryTranslations;
        const name = formatLanguageResponse(translations);

        delete subCategory.SubCategoryTranslations;

        formattedSubCategories.push({ ...subCategory, name });
      }

      return {
        data: formattedSubCategories,
        totalDocs: subCategories.length,
        totalPage: 1,
      };
    }
    const where: any = {
      ...(data.status == 2
        ? {}
        : {
            status: data.status,
          }),
      categoryId: data.categoryId,
    };

    if (data.search) {
      where.SubCategoryTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
            mode: 'insensitive',
          },
        },
      };
    }

    const count = await this.prisma.subCategory.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const subCategories = await this.prisma.subCategory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        SubCategoryTranslations: {
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
      },
      take: pagination.take,
      skip: pagination.skip,
    });

    const formattedSubCategories = [];

    for (let i = 0; i < subCategories.length; i++) {
      const subCategory = subCategories[i];
      const translations = subCategory.SubCategoryTranslations;
      const name = formatLanguageResponse(translations);

      delete subCategory.SubCategoryTranslations;

      formattedSubCategories.push({ ...subCategory, name });
    }

    return {
      data: formattedSubCategories,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<SubCategoryInterfaces.Response> {
    const subCategory = await this.prisma.subCategory.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        category: true,
        SubCategoryTranslations: {
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
    if (!subCategory) {
      throw new NotFoundException('SubCategory is not found');
    }

    const name = formatLanguageResponse(subCategory.SubCategoryTranslations);

    delete subCategory.SubCategoryTranslations;

    return { ...subCategory, name };
  }

  async update(
    data: SubCategoryUpdateDto
  ): Promise<SubCategoryInterfaces.Response> {
    const subCategory = await this.findOne({ id: data.id });

    if (data.categoryId) {
      await this.categoryService.findOne({ id: data.categoryId });
    }

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

    return await this.prisma.subCategory.update({
      where: {
        id: subCategory.id,
      },
      data: {
        staffNumber: data.staffNumber || subCategory.staffNumber,
        categoryId: data.categoryId || subCategory.categoryId,
        SubCategoryTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
      },
      include: {
        category: true,
        SubCategoryTranslations: true,
      },
    });
  }

  async remove(data: DeleteDto): Promise<SubCategoryInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.subCategory.delete({
        where: { id: data.id },
        include: {
          category: true,
          SubCategoryTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
    }

    return await this.prisma.subCategory.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        category: true,
        SubCategoryTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }

  async restore(data: GetOneDto): Promise<SubCategoryInterfaces.Response> {
    return this.prisma.subCategory.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        category: true,
        SubCategoryTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }
}
