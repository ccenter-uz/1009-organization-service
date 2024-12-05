import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  SubCategoryCreateDto,
  SubCategoryInterfaces,
  SubCategoryUpdateDto,
} from 'types/organization/sub-category';
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
        SubCategoryTranslations: true,
      },
    });
    return subCategory;
  }

  async findAll(
    data: LanguageRequestDto
  ): Promise<SubCategoryInterfaces.ResponseWithoutPagination> {
    const subCategories = await this.prisma.subCategory.findMany({
      orderBy: { createdAt: 'desc' },
      where: { categoryId: data.category_id },
      include: {
        SubCategoryTranslations: {
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
    };
  }

  async findAllByPagination(
    data: ListQueryDto
  ): Promise<SubCategoryInterfaces.ResponseWithPagination> {
    const where: any = { status: DefaultStatus.ACTIVE, categoryId: data.category_id };
    if (data.search) {
      where.SubCategoryTranslations = {
        some: {
          languageCode: data.lang_code,
          name: {
            contains: data.search,
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
      where: {
        status: DefaultStatus.ACTIVE,
        categoryId: data.category_id
      },
      orderBy: { createdAt: 'desc' },
      include: {
        SubCategoryTranslations: {
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
        SubCategoryTranslations: {
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
    if (!subCategory) {
      throw new NotFoundException('SubCategory is not found');
    }
    const name = formatLanguageResponse(subCategory.SubCategoryTranslations);
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
        SubCategoryTranslations: true,
      },
    });
  }

  async remove(data: DeleteDto): Promise<SubCategoryInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.subCategory.delete({
        where: { id: data.id },
        include: {
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
