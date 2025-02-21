import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestEnum,
  ListQueryDto,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import {
  ProductServiseCategoryCreateDto,
  ProductServiseCategoryInterfaces,
  ProductServiseCategoryUpdateDto,
} from 'types/organization/product-service-category';
import { Prisma } from '@prisma/client';
import { getSingleOrderedData } from '@/common/helper/sql-rows-for-select/get-single-ordered-data.dto';
import { ListQueryWithOrderDto } from 'types/global/dto/list-query-with-order.dto';

@Injectable()
export class ProductServiceCategoryService {
  private logger = new Logger(ProductServiceCategoryService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: ProductServiseCategoryCreateDto
  ): Promise<ProductServiseCategoryInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const productServiceCategory =
      await this.prisma.productServiceCategory.create({
        data: {
          staffNumber: data.staffNumber,
          orderNumber: data.orderNumber,
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

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      productServiceCategory
    );

    return productServiceCategory;
  }

  async findAll(
    data: ListQueryWithOrderDto
  ): Promise<ProductServiseCategoryInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const conditions: Prisma.Sql[] = [];
    if (data.status === 0 || data.status === 1)
      conditions.push(Prisma.sql`c.status = ${data.status}`);
    if (data.search) {
      conditions.push(Prisma.sql`
              EXISTS (
                SELECT 1
                FROM product_service_category_translations ct
                WHERE ct.product_service_category_id = c.id
                  AND ct.name ILIKE ${`%${data.search}%`}
                ORDER BY ct.language_code   
                LIMIT 1
              )
            `);
    }

    if (data.all) {
      const productServiceCategories = await getSingleOrderedData(
        'ProductServiceCategory',
        'product_service_category',
        this.prisma,
        data,
        conditions
      );

      const formattedCategories = productServiceCategories.map(
        (productServiceCategory) => {
          const translations =
            productServiceCategory.ProductServiceCategoryTranslations;

          const name = formatLanguageResponse(translations);
          delete productServiceCategory.ProductServiceCategoryTranslations;

          return { ...productServiceCategory, name };
        }
      );
      this.logger.debug(
        `Method: ${methodName} - Response: `,
        formattedCategories
      );

      return {
        data: formattedCategories,
        totalDocs: productServiceCategories.length,
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
      where.ProductServiceCategoryTranslations = {
        some: {
          name: {
            contains: data.search,
            mode: 'insensitive',
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

    const productServiceCategories = await getSingleOrderedData(
      'ProductServiceCategory',
      'product_service_category',
      this.prisma,
      data,
      conditions,
      pagination
    );

    const formattedCategories = productServiceCategories.map(
      (productServiceCategory) => {
        const translations =
          productServiceCategory.ProductServiceCategoryTranslations;

        const name = formatLanguageResponse(translations);
        delete productServiceCategory.ProductServiceCategoryTranslations;

        return { ...productServiceCategory, name };
      }
    );
    this.logger.debug(
      `Method: ${methodName} - Response: `,
      formattedCategories
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
    const methodName: string = this.findOne.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const productServiceCategory =
      await this.prisma.productServiceCategory.findFirst({
        where: {
          id: data.id,
          status: DefaultStatus.ACTIVE,
        },
        include: {
          ProductServiceCategoryTranslations: {
            where: data.allLang
              ? {}
              : {
                  languageCode: data.langCode, // langCode from request
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
    this.logger.debug(
      `Method: ${methodName} - Response: `,
      productServiceCategory
    );

    return { ...productServiceCategory, name };
  }

  async update(
    data: ProductServiseCategoryUpdateDto
  ): Promise<ProductServiseCategoryInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const productServiceCategory = await this.findOne({ id: data.id });

    const updatedCategory = await this.prisma.productServiceCategory.update({
      where: {
        id: productServiceCategory.id,
      },
      data: {
        staffNumber: data.staffNumber,
        orderNumber: data.orderNumber,
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

    this.logger.debug(`Method: ${methodName} - Response: `, updatedCategory);

    return updatedCategory;
  }

  async remove(
    data: DeleteDto
  ): Promise<ProductServiseCategoryInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.delete) {
      const deletedCategory = await this.prisma.productServiceCategory.delete({
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

      this.logger.debug(`Method: ${methodName} - Response: `, deletedCategory);

      return deletedCategory;
    }

    const updatedCategory = await this.prisma.productServiceCategory.update({
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

    this.logger.debug(`Method: ${methodName} - Response: `, updatedCategory);

    return updatedCategory;
  }

  async restore(
    data: GetOneDto
  ): Promise<ProductServiseCategoryInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const updatedCategory = this.prisma.productServiceCategory.update({
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

    this.logger.debug(`Method: ${methodName} - Response: `, updatedCategory);

    return updatedCategory;
  }
}
