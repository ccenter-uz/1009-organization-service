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
import { getOrderedData } from '@/common/helper/sql-rows-for-select/get-ordered-data.dto';
import { Prisma } from '@prisma/client';
import { getSubCategoryOrderedData } from '@/common/helper/sql-rows-for-select/sub-category-get-ordered.dto';
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
        orderNumber: data.orderNumber,
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
    const conditions: Prisma.Sql[] = [];
    if (data.status === 0 || data.status === 1)
      conditions.push(Prisma.sql`c.status = ${data.status}`);
    if (data.search) {
      if (data.langCode) {
        conditions.push(Prisma.sql`
                  EXISTS (
                    SELECT 1
                    FROM sub_category_translations ct
                    WHERE ct.sub_category_id = c.id
                      AND ct.language_code = ${data.langCode}
                      AND ct.name ILIKE ${`%${data.search}%`}
                  )
                `);
      } else {
        conditions.push(Prisma.sql`
                  EXISTS (
                    SELECT 1
                    FROM sub_category_translations ct
                    WHERE ct.sub_category_id = c.id
                      AND ct.name ILIKE ${`%${data.search}%`}
                    ORDER BY ct.language_code   
                    LIMIT 1
                  )
                `);
      }
    }
    if (data.categoryId) {
      conditions.push(Prisma.sql`c.category_id = ${data.categoryId}`);
    }
    if (data.all) {
     
      const subCategories = await getSubCategoryOrderedData(
        'SubCategory',
        'sub_category',
        this.prisma,
        data,
        conditions
      );
      const formattedSubCategories = [];

      for (let i = 0; i < subCategories.length; i++) {
        const subCategory = subCategories[i];
        const translations = subCategory.SubCategoryTranslations;
        const name = formatLanguageResponse(translations);

        delete subCategory.SubCategoryTranslations;

        const category: any = subCategories[i].category;
        const categorytTranslations = category.CategoryTranslations;
        const categoryName = formatLanguageResponse(categorytTranslations);

        category.name = categoryName;
        delete category.CategoryTranslations;

        delete subCategory.SubCategoryTranslations;

        formattedSubCategories.push({ ...subCategory, name, category });
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

    const subCategories = await getSubCategoryOrderedData(
      'SubCategory',
      'sub_category',
      this.prisma,
      data,
      conditions,
      pagination
    );

    const formattedSubCategories = [];

    for (let i = 0; i < subCategories.length; i++) {
      const subCategory = subCategories[i];
      const translations = subCategory.SubCategoryTranslations;
      const name = formatLanguageResponse(translations);

      const category: any = subCategories[i].category;
      const categorytTranslations = category.CategoryTranslations;
      const categoryName = formatLanguageResponse(categorytTranslations);

      category.name = categoryName;

      delete category.CategoryTranslations;
      delete subCategory.SubCategoryTranslations;
      delete subCategory.SubCategoryTranslations;

      formattedSubCategories.push({ ...subCategory, name, category });
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
        category: {
          include: {
            CategoryTranslations: {
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

    const category: any = subCategory.category;
    const categorytTranslations = category.CategoryTranslations;
    const categoryName = formatLanguageResponse(categorytTranslations);

    category.name = categoryName;
    delete category.CategoryTranslations;

    delete subCategory.SubCategoryTranslations;
    delete subCategory.SubCategoryTranslations;

    return { ...subCategory, name, category };
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
        orderNumber: data.orderNumber,
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
