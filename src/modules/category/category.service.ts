import { Injectable, NotFoundException } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { CategoryCreateDto, CategoryInterfaces, CategoryUpdateDto } from 'types/organization/category';
import { JsonValue } from 'types/global/types';
import { DeleteDto, GetOneDto, ListQueryDto } from 'types/global';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: CategoryCreateDto): Promise<CategoryInterfaces.Response> {
    return await this.prisma.category.create({
      data: {
        staffNumber: data.staffNumber,
        name: data.name as JsonValue,
      },
    });
  }

  async findAll(
    data: ListQueryDto,
  ): Promise<CategoryInterfaces.ResponseWithoutPagination> {
    const categories = await this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: categories,
      totalDocs: categories.length,
    };
  }

  async findAllByPagination(
    data: ListQueryDto,
  ): Promise<CategoryInterfaces.ResponseWithPagination> {
    const count = await this.prisma.category.count();

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const currencies = await this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
    });

    return {
      data: currencies,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<CategoryInterfaces.Response> {
    const category = await this.prisma.category.findFirst({
      where: {
        id: data.id,
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
        name: data.name as JsonValue
      },
    });
  }

  async remove(data: DeleteDto): Promise<CategoryInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.category.delete({
        where: { id: data.id },
      });
    }

    // return await this.prisma.category.update({
    //   where: { id: data.id, status: DefaultStatus.ACTIVE },
    //   data: { status: DefaultStatus.DELETED },
    // });
    return
  }

  async restore(data: GetOneDto): Promise<CategoryInterfaces.Response> {
    // return this.prisma.category.update({
    //   where: { id: data.id, status: DefaultStatus.DELETED },
    //   data: { status: DefaultStatus.ACTIVE },
    // });
    return
  }
}
