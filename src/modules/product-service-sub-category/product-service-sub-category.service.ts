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
    private readonly ProductServiceCategoryService: ProductServiceCategoryService
  ) {}

  async create(
    data: ProductServiceSubCategoryCreateDto
  ): Promise<ProductServiceSubCategoryInterfaces.Response> {
    const ProductServiceCategory =
      await this.ProductServiceCategoryService.findOne({
        id: data.productServiceCategoryId,
      });
    const subCategory = await this.prisma.productServiceSubCategory.create({
      data: {
        staffNumber: data.staffNumber,
        productServiceCategoryId: ProductServiceCategory.id,
        ProductServiceSubCategoryTranslations: {
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
        ProductServiceCategory: true,
        ProductServiceSubCategoryTranslations: true,
      },
    });
    return subCategory;
  }

  async findAll(
    data: ProductServiceSubCategoryFilterDto
  ): Promise<ProductServiceSubCategoryInterfaces.ResponseWithPagination> {
    if (data.all) {
      const ProductServiceSubCategories =
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
            ProductServiceCategory: true,
            ProductServiceSubCategoryTranslations: {
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

      for (let i = 0; i < ProductServiceSubCategories.length; i++) {
        const subCategory = ProductServiceSubCategories[i];
        const translations = subCategory.ProductServiceSubCategoryTranslations;
        const name = formatLanguageResponse(translations);

        delete subCategory.ProductServiceSubCategoryTranslations;

        formattedSubCategories.push({ ...subCategory, name });
      }

      return {
        data: formattedSubCategories,
        totalDocs: ProductServiceSubCategories.length,
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
      where.ProductServiceSubCategoryTranslations = {
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

    const ProductServiceSubCategories =
      await this.prisma.productServiceSubCategory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          ProductServiceCategory: true,
          ProductServiceSubCategoryTranslations: {
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

    for (let i = 0; i < ProductServiceSubCategories.length; i++) {
      const subCategory = ProductServiceSubCategories[i];
      const translations = subCategory.ProductServiceSubCategoryTranslations;
      const name = formatLanguageResponse(translations);

      delete subCategory.ProductServiceSubCategoryTranslations;

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
    const ProductServiceSubCategory =
      await this.prisma.productServiceSubCategory.findFirst({
        where: {
          id: data.id,
          status: DefaultStatus.ACTIVE,
        },
        include: {
          ProductServiceCategory: true,
          ProductServiceSubCategoryTranslations: {
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
    if (!ProductServiceSubCategory) {
      throw new NotFoundException('SubCategory is not found');
    }
    const name = formatLanguageResponse(
      ProductServiceSubCategory.ProductServiceSubCategoryTranslations
    );
    delete ProductServiceSubCategory.ProductServiceSubCategoryTranslations;
    return { ...ProductServiceSubCategory, name };
  }

  async update(
    data: ProductServiceSubCategoryUpdateDto
  ): Promise<ProductServiceSubCategoryInterfaces.Response> {
    const ProductServiceSubCategory = await this.findOne({ id: data.id });

    if (data.productServiceCategoryId) {
      await this.ProductServiceCategoryService.findOne({
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
        id: ProductServiceSubCategory.id,
      },
      data: {
        staffNumber: data.staffNumber || ProductServiceSubCategory.staffNumber,
        productServiceCategoryId:
          data.productServiceCategoryId ||
          ProductServiceSubCategory.productServiceCategoryId,

        ProductServiceSubCategoryTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
      },
      include: {
        ProductServiceCategory: true,
        ProductServiceSubCategoryTranslations: true,
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
          ProductServiceCategory: true,
          ProductServiceSubCategoryTranslations: {
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
        ProductServiceCategory: true,
        ProductServiceSubCategoryTranslations: {
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
        ProductServiceCategory: true,
        ProductServiceSubCategoryTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }
}
