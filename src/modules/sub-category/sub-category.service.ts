import {
  Injectable,
  Logger,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
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
import { Prisma } from '@prisma/client';
import { getSubCategoryOrderedData } from '@/common/helper/sql-rows-for-select/get-sub-category-ordered.dto';
import { SubCategoryDeleteDto } from 'types/organization/sub-category/dto/delete-sub-category.dto';
@Injectable()
export class SubCategoryService {
  private logger = new Logger(SubCategoryService.name);

  constructor(
    @Inject(forwardRef(() => CategoryService))
    private readonly categoryService: CategoryService,
    private readonly prisma: PrismaService
  ) {}

  async create(
    data: SubCategoryCreateDto
  ): Promise<SubCategoryInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
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
    this.logger.debug(`Method: ${methodName} - Response: `, subCategory);

    return subCategory;
  }

  async findAll(
    data: SubCategoryFilterDto
  ): Promise<SubCategoryInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const conditions: Prisma.Sql[] = [];
    if (data.status === 0 || data.status === 1)
      conditions.push(Prisma.sql`c.status = ${data.status}`);
    if (data.search) {
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
    if (data.categoryId) {
      conditions.push(Prisma.sql`c.category_id = ${data.categoryId}`);
    }
    if (data.all) {
      const subCategories = await getSubCategoryOrderedData(
        'SubCategory',
        'sub_category',
        'Category',
        'category',
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

        const category: any = subCategories[i].Category;
        const categoryTranslations = category.CategoryTranslations;
        const categoryName = formatLanguageResponse(categoryTranslations);

        category.name = categoryName;
        delete category.CategoryTranslations;

        delete subCategory.SubCategoryTranslations;

        formattedSubCategories.push({ ...subCategory, name, category });
      }
      this.logger.debug(
        `Method: ${methodName} - Response: `,
        formattedSubCategories
      );

      return {
        data: formattedSubCategories,
        totalDocs: subCategories.length,
        totalPage: subCategories.length > 0 ? 1 : 0,
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
      'Category',
      'category',
      this.prisma,
      data,
      conditions,
      pagination
    );


    this.logger.debug(`Method: ${methodName} - Response: `, subCategories);
    return {
      data: subCategories,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<SubCategoryInterfaces.Response> {
    const methodName: string = this.findOne.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
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
    this.logger.debug(`Method: ${methodName} - Response: `, subCategory);

    return { ...subCategory, name, category };
  }

  async update(
    data: SubCategoryUpdateDto
  ): Promise<SubCategoryInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
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

    const updatedSubCategory = await this.prisma.subCategory.update({
      where: {
        id: subCategory.id,
      },
      data: {
        editedStaffNumber: data.staffNumber,
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

    this.logger.debug(`Method: ${methodName} - Response: `, updatedSubCategory);

    return updatedSubCategory;
  }

  async remove(
    data: SubCategoryDeleteDto
  ): Promise<SubCategoryInterfaces.Response> {
    const methodName: string = this.remove.name;
    console.log(data, 'data');

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.delete) {
      const deletedSubCategory = await this.prisma.subCategory.delete({
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

      this.logger.debug(
        `Method: ${methodName} - Response: `,
        deletedSubCategory
      );

      return deletedSubCategory;
    }

    const updatedSubCategory = await this.prisma.subCategory.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE, deleteReason: data.deleteReason },
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
    this.logger.debug(`Method: ${methodName} - Response: `, updatedSubCategory);

    return updatedSubCategory;
  }

  async restore(data: GetOneDto): Promise<SubCategoryInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const updatedSubCategory = this.prisma.subCategory.update({
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
    this.logger.debug(`Method: ${methodName} - Response: `, updatedSubCategory);

    return updatedSubCategory;
  }
}
