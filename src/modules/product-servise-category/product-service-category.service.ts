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
  ProductServiseCategoryCreateDto,
  ProductServiseCategoryInterfaces,
  ProductServiseCategoryUpdateDto,
} from 'types/organization/product-service-category';

@Injectable()
export class ProductServiceCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: ProductServiseCategoryCreateDto
  ): Promise<ProductServiseCategoryInterfaces.Response> {
    const productServiceCategory =
      await this.prisma.productServiceCategory.create({
        data: {
          staffNumber: data.staffNumber,

          ProductServiceCategoryTranslations: {
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
          ProductServiceCategoryTranslations: true,
        },
      });
    return productServiceCategory;
  }

  async findAll(
    data: ListQueryDto
  ): Promise<ProductServiseCategoryInterfaces.ResponseWithPagination> {
    if (data.all) {
      const productServiceCategories =
        await this.prisma.productServiceCategory.findMany({
          orderBy: { createdAt: 'desc' },
          where: {
            ...(data.status !== 2
              ? {
                  status: data.status,
                }
              : {}),
          },
          include: {
            ProductServiceCategoryTranslations: {
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

      const formattedCategories = productServiceCategories.map(
        (productServiceCategory) => {
          const translations =
            productServiceCategory.ProductServiceCategoryTranslations;

          const name = formatLanguageResponse(translations);
          delete productServiceCategory.ProductServiceCategoryTranslations;

          return { ...productServiceCategory, name };
        }
      );

      return {
        data: formattedCategories,
        totalDocs: productServiceCategories.length,
        totalPage: 1,
      };
    }

    const where: any = {
      ...(data.all_lang
        ? {}
        : {
            languageCode: data.lang_code,
          }),
      ...(data.status == 2
        ? {}
        : {
            status: data.status,
          }),
    };
    if (data.search) {
      where.ProductServiceCategoryTranslations = {
        some: {
          languageCode: data.lang_code,
          name: {
            contains: data.search,
          },
        },
      };
    }

    const count = await this.prisma.productServiceCategory.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const productServiceCategories =
      await this.prisma.productServiceCategory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          ProductServiceCategoryTranslations: {
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

    const formattedCategories = productServiceCategories.map(
      (productServiceCategory) => {
        const translations =
          productServiceCategory.ProductServiceCategoryTranslations;

        const name = formatLanguageResponse(translations);
        delete productServiceCategory.ProductServiceCategoryTranslations;

        return { ...productServiceCategory, name };
      }
    );

    return {
      data: formattedCategories,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(
    data: GetOneDto
  ): Promise<ProductServiseCategoryInterfaces.Response> {
    const productServiceCategory =
      await this.prisma.productServiceCategory.findFirst({
        where: {
          id: data.id,
          status: DefaultStatus.ACTIVE,
        },
        include: {
          ProductServiceCategoryTranslations: {
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

    if (!productServiceCategory) {
      throw new NotFoundException('Product Service Category is not found');
    }

    const name = formatLanguageResponse(
      productServiceCategory.ProductServiceCategoryTranslations
    );
    delete productServiceCategory.ProductServiceCategoryTranslations;

    return { ...productServiceCategory, name };
  }

  async update(
    data: ProductServiseCategoryUpdateDto
  ): Promise<ProductServiseCategoryInterfaces.Response> {
    const productServiceCategory = await this.findOne({ id: data.id });

    return await this.prisma.productServiceCategory.update({
      where: {
        id: productServiceCategory.id,
      },
      data: {
        staffNumber: data.staffNumber,
        ProductServiceCategoryTranslations: {
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
        ProductServiceCategoryTranslations: true, // Include translations in the response
      },
    });
  }

  async remove(
    data: DeleteDto
  ): Promise<ProductServiseCategoryInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.productServiceCategory.delete({
        where: { id: data.id },
        include: {
          ProductServiceCategoryTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      });
    }

    return await this.prisma.productServiceCategory.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        ProductServiceCategoryTranslations: {
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
  ): Promise<ProductServiseCategoryInterfaces.Response> {
    return this.prisma.productServiceCategory.update({
      where: { id: data.id, status: DefaultStatus.INACTIVE },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        ProductServiceCategoryTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
      },
    });
  }
}
