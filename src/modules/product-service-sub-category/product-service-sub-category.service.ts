import { ProductServiceSubCategoryFilterDto } from './../../../types/organization/product-service-sub-category/dto/filter-product-service-sub-category.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestEnum,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { createPagination } from '@/common/helper/pagination.helper';
import { ProductServiceCategoryService } from '../product-servise-category/product-service-category.service';
import {
  ProductServiceSubCategoryCreateDto,
  ProductServiceSubCategoryInterfaces,
  ProductServiceSubCategoryUpdateDto,
} from 'types/organization/product-service-sub-category';
@Injectable()
export class ProductServiceSubCategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productServiceCategoryService: ProductServiceCategoryService
  ) {}

  async create(
    data: ProductServiceSubCategoryCreateDto
  ): Promise<ProductServiceSubCategoryInterfaces.Response> {
    const productServiceCategory =
      await this.productServiceCategoryService.findOne({
        id: data.productServiceCategoryId,
      });
    const subCategory = await this.prisma.productServiceSubCategory.create({
      data: {
        staffNumber: data.staffNumber,
        productServiceCategoryId: productServiceCategory.id,
        productServiceSubCategoryTranslations: {
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
        productServiceCategory: true,
        productServiceSubCategoryTranslations: true,
      },
    });
    return subCategory;
  }

  async findAll(
    data: ProductServiceSubCategoryFilterDto
  ): Promise<ProductServiceSubCategoryInterfaces.ResponseWithPagination> {
    if (data.all) {
      const productServiceSubCategories =
        await this.prisma.productServiceSubCategory.findMany({
          orderBy: { createdAt: 'desc' },
          where: {
            ...(data.status == 2
              ? {}
              : {
                  status: data.status,
                }),
            productServiceCategoryId: data.categoryId,
          },

          include: {
            productServiceCategory: true,
            productServiceSubCategoryTranslations: {
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

      for (let i = 0; i < productServiceSubCategories.length; i++) {
        const subCategory = productServiceSubCategories[i];
        const translations = subCategory.productServiceSubCategoryTranslations;
        const name = formatLanguageResponse(translations);

        delete subCategory.productServiceSubCategoryTranslations;

        formattedSubCategories.push({ ...subCategory, name });
      }

      return {
        data: formattedSubCategories,
        totalDocs: productServiceSubCategories.length,
        totalPage: 1,
      };
    }

    const where: any = {
      ...(data.status == 2
        ? {}
        : {
            status: data.status,
          }),
      productServiceCategoryId: data.categoryId,
    };
    if (data.search) {
      where.productServiceSubCategoryTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
          },
        },
      };
    }
    const count = await this.prisma.productServiceSubCategory.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const productServiceSubCategories =
      await this.prisma.productServiceSubCategory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          productServiceCategory: true,
          productServiceSubCategoryTranslations: {
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

    for (let i = 0; i < productServiceSubCategories.length; i++) {
      const subCategory = productServiceSubCategories[i];
      const translations = subCategory.productServiceSubCategoryTranslations;
      const name = formatLanguageResponse(translations);

      delete subCategory.productServiceSubCategoryTranslations;

      formattedSubCategories.push({ ...subCategory, name });
    }

    return {
      data: formattedSubCategories,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(
    data: GetOneDto
  ): Promise<ProductServiceSubCategoryInterfaces.Response> {
    const productServiceSubCategory =
      await this.prisma.productServiceSubCategory.findFirst({
        where: {
          id: data.id,
          status: DefaultStatus.ACTIVE,
        },
        include: {
          productServiceCategory: true,
          productServiceSubCategoryTranslations: {
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
    if (!productServiceSubCategory) {
      throw new NotFoundException('SubCategory is not found');
    }
    const name = formatLanguageResponse(
      productServiceSubCategory.productServiceSubCategoryTranslations
    );
    delete productServiceSubCategory.productServiceSubCategoryTranslations;
    return { ...productServiceSubCategory, name };
  }

  async update(
    data: ProductServiceSubCategoryUpdateDto
  ): Promise<ProductServiceSubCategoryInterfaces.Response> {
    const productServiceSubCategory = await this.findOne({ id: data.id });

    if (data.productServiceCategoryId) {
      await this.productServiceCategoryService.findOne({
        id: data.productServiceCategoryId,
      });
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

    return await this.prisma.productServiceSubCategory.update({
      where: {
        id: productServiceSubCategory.id,
      },
      data: {
        staffNumber: data.staffNumber || productServiceSubCategory.staffNumber,
        productServiceCategoryId:
          data.productServiceCategoryId ||
          productServiceSubCategory.productServiceCategoryId,

        productServiceSubCategoryTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
      },
      include: {
        productServiceCategory: true,
        productServiceSubCategoryTranslations: true,
      },
    });
  }

  async remove(
    data: DeleteDto
  ): Promise<ProductServiceSubCategoryInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.productServiceSubCategory.delete({
        where: { id: data.id },
        include: {
          productServiceCategory: true,
          productServiceSubCategoryTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
    }

    return await this.prisma.productServiceSubCategory.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        productServiceCategory: true,
        productServiceSubCategoryTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }

  async restore(
    data: GetOneDto
  ): Promise<ProductServiceSubCategoryInterfaces.Response> {
    return this.prisma.productServiceSubCategory.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        productServiceCategory: true,
        productServiceSubCategoryTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }
}
