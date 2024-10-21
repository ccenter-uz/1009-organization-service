import { Injectable, NotFoundException } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  CategoryCreateDto,
  CategoryInterfaces,
  CategoryUpdateDto,
} from 'types/organization/category';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestEnum,
  ListQueryDto,
} from 'types/global';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: CategoryCreateDto): Promise<CategoryInterfaces.Response> {
    const category = await this.prisma.category.create({
      data: {
        staffNumber: data.staffNumber,
        CategoryTranslations: {
          create: [
            { languageCode: LanguageRequestEnum.RU, name: data.name[LanguageRequestEnum.RU] },
            { languageCode: LanguageRequestEnum.UZ, name: data.name[LanguageRequestEnum.UZ] },
            { languageCode: LanguageRequestEnum.CY, name: data.name[LanguageRequestEnum.CY] },
          ]
        }
      },
      include: {
        CategoryTranslations: true,
      },
    });
    return category
  }

  async findAll(): Promise<CategoryInterfaces.ResponseWithoutPagination> {
    const categories = await this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        CategoryTranslations: {
          where: {
            languageCode: LanguageRequestEnum.RU, // lang_code from request
          },
          select: {
            languageCode: true,  // Select only languageCode
            name: true,          // Select only name
          },
        }
      },
    });

    return {
      data: categories,
      totalDocs: categories.length,
    };
  }

  async findAllByPagination(
    data: ListQueryDto
  ): Promise<CategoryInterfaces.ResponseWithPagination> {
    const count = await this.prisma.category.count({
      where: {
        status: DefaultStatus.ACTIVE,
      },
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const categories = await this.prisma.category.findMany({
      where: {
        status: DefaultStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        CategoryTranslations: {
          where: {
            languageCode: LanguageRequestEnum.RU, // lang_code from request

          },
          select: {
            languageCode: true,  // Select only languageCode
            name: true,          // Select only name
          },
        }
      },
      take: pagination.take,
      skip: pagination.skip,
    });

    return {
      data: categories,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<CategoryInterfaces.Response> {
    const category = await this.prisma.category.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        CategoryTranslations: {
          where: {
            languageCode: LanguageRequestEnum.RU, // lang_code from request

          },
          select: {
            languageCode: true,  // Select only languageCode
            name: true,          // Select only name
          },
        }
      },
    });

    if (!category) {
      throw new NotFoundException('Category is not found');
    }

    return category;
  }

  async update(data: CategoryUpdateDto): Promise<CategoryInterfaces.Response> {
    const category = await this.findOne({ id: data.id });

    return await this.prisma.category.update({
      where: {
        id: category.id,
      },
      data: {
        staffNumber: data.staffNumber,
        CategoryTranslations: {
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
          ]
        }
      },
      include: {
        CategoryTranslations: true, // Include translations in the response
      },
    });
  }

  async remove(data: DeleteDto): Promise<CategoryInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.category.delete({
        where: { id: data.id },
      });
    }

    return await this.prisma.category.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
    });
  }

  async restore(data: GetOneDto): Promise<CategoryInterfaces.Response> {
    return this.prisma.category.update({
      where: { id: data.id, status: DefaultStatus.INACTIVE },
      data: { status: DefaultStatus.ACTIVE },
    });
  }
}
