import {
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
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
import { getSubCategoryOrderedData } from '@/common/helper/sql-rows-for-select/get-sub-category-ordered.dto';
import { Prisma } from '@prisma/client';
import { ProductServiceSubCategoryDeleteDto } from 'types/organization/product-service-sub-category/dto/delete-product-service-sub-category.dto';
import { ProductServiceSubCategoryFilterDto } from './../../../types/organization/product-service-sub-category/dto/filter-product-service-sub-category.dto';
@Injectable()
export class ProductServiceSubCategoryService {
  private logger = new Logger(ProductServiceSubCategoryService.name);
  constructor(
    @Inject(forwardRef(() => ProductServiceCategoryService))
    private readonly ProductServiceCategoryService: ProductServiceCategoryService,
    private readonly prisma: PrismaService
  ) {}

  async create(
    data: ProductServiceSubCategoryCreateDto
  ): Promise<ProductServiceSubCategoryInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const ProductServiceCategory =
      await this.ProductServiceCategoryService.findOne({
        id: data.productServiceCategoryId,
      });
    const subCategory = await this.prisma.productServiceSubCategory.create({
      data: {
        staffNumber: data.staffNumber,
        orderNumber: data.orderNumber,
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

    this.logger.debug(`Method: ${methodName} - Response: `, subCategory);
    await this.prisma.$executeRawUnsafe(`
        UPDATE product_service_sub_category_translations 
        SET search_vector = to_tsvector('simple', name) 
        WHERE product_service_sub_category_id = ${subCategory.id}
      `);
    return subCategory;
  }

  async findAll(
    data: ProductServiceSubCategoryFilterDto
  ): Promise<ProductServiceSubCategoryInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const conditions: Prisma.Sql[] = [];
    if (data.status === 0 || data.status === 1)
      conditions.push(Prisma.sql`c.status = ${data.status}`);
    if (data.search) {
      conditions.push(Prisma.sql`
                      EXISTS (
                        SELECT 1
                        FROM product_service_sub_category_translations ct
                        WHERE ct.product_service_sub_category_id = c.id
                          AND ct.name ILIKE ${`%${data.search}%`}
                        ORDER BY ct.language_code   
                        LIMIT 1
                      )
                    `);
    }
    if (data.categoryId) {
      conditions.push(
        Prisma.sql`c.product_service_category_id = ${data.categoryId}`
      );
    }
    if (data.all) {
      const ProductServiceSubCategories = await getSubCategoryOrderedData(
        'ProductServiceSubCategory',
        'product_service_sub_category',
        'ProductServiceCategory',
        'product_service_category',
        this.prisma,
        data,
        conditions
      );

      this.logger.debug(
        `Method: ${methodName} - Response: `,
        ProductServiceSubCategories
      );

      return {
        data: ProductServiceSubCategories,
        totalDocs: ProductServiceSubCategories.length,
        totalPage: ProductServiceSubCategories.length > 0 ? 1 : 0,
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
          name: {
            contains: data.search,
            mode: 'insensitive',
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

    const ProductServiceSubCategories = await getSubCategoryOrderedData(
      'ProductServiceSubCategory',
      'product_service_sub_category',
      'ProductServiceCategory',
      'product_service_category',
      this.prisma,
      data,
      conditions,
      pagination
    );

    this.logger.debug(
      `Method: ${methodName} -  Response: `,
      ProductServiceSubCategories
    );

    return {
      data: ProductServiceSubCategories,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(
    data: GetOneDto
  ): Promise<ProductServiceSubCategoryInterfaces.Response> {
    const methodName: string = this.findOne.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
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
      throw new NotFoundException('Product Service Sub Category is not found');
    }
    const name = formatLanguageResponse(
      ProductServiceSubCategory.ProductServiceSubCategoryTranslations
    );
    delete ProductServiceSubCategory.ProductServiceSubCategoryTranslations;
    this.logger.debug(
      `Method: ${methodName} - Response: `,
      ProductServiceSubCategory
    );

    return { ...ProductServiceSubCategory, name };
  }

  async update(
    data: ProductServiceSubCategoryUpdateDto
  ): Promise<ProductServiceSubCategoryInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
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

    const updatedProductCategory =
      await this.prisma.productServiceSubCategory.update({
        where: {
          id: ProductServiceSubCategory.id,
        },
        data: {
          editedStaffNumber: data.staffNumber,
          orderNumber: data.orderNumber,
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

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedProductCategory
    );

    return updatedProductCategory;
  }

  async remove(
    data: ProductServiceSubCategoryDeleteDto
  ): Promise<ProductServiceSubCategoryInterfaces.Response> {
    const methodName: string = this.remove.name;
    console.log(data, 'data');

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.delete) {
      const deletedProductCategory =
        await this.prisma.productServiceSubCategory.delete({
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

      this.logger.debug(
        `Method: ${methodName} - Response: `,
        deletedProductCategory
      );

      return deletedProductCategory;
    }

    const updatedProductCategory =
      await this.prisma.productServiceSubCategory.update({
        where: { id: data.id, status: DefaultStatus.ACTIVE },
        data: {
          status: DefaultStatus.INACTIVE,
          deleteReason: data.deleteReason,
        },
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

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedProductCategory
    );

    return updatedProductCategory;
  }

  async restore(
    data: GetOneDto
  ): Promise<ProductServiceSubCategoryInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const updatedProductCategory = this.prisma.productServiceSubCategory.update(
      {
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
      }
    );

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedProductCategory
    );

    return updatedProductCategory;
  }
}
