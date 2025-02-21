import {
  DistrictNewNameTranslations,
  DistrictOldNameTranslations,
} from './../../../node_modules/.prisma/client/index.d';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { CityRegionFilterDto } from 'types/global/dto/city-region-filter.dto';
import { Prisma } from '@prisma/client';
import { getOrderedData } from '@/common/helper/sql-rows-for-select/get-ordered-data.dto';

@Injectable()
export class CategoryService {
  private logger = new Logger(CategoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CategoryCreateDto): Promise<CategoryInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const category = await this.prisma.category.create({
      data: {
        staffNumber: data.staffNumber,
        cityId: data.cityId,
        regionId: data.regionId,
        ...(data?.districtId ? { districtId: data.districtId } : {}),
        orderNumber: data.orderNumber,
        CategoryTranslations: {
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
        CategoryTranslations: true,
        city: {
          include: {
            CityTranslations: {
              select: {
                languageCode: true,
                name: true,
              },
            },
            Region: {
              include: {
                RegionTranslations: {
                  select: {
                    languageCode: true,
                    name: true,
                  },
                },
              },
            },

            District: {
              include: {
                DistrictNewNameTranslations: {
                  select: {
                    languageCode: true,
                    name: true,
                  },
                },
                DistrictOldNameTranslations: {
                  select: {
                    languageCode: true,
                    name: true,
                  },
                },
                DistrictTranslations: {
                  select: {
                    languageCode: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, data);

    return category;
  }

  async findAll(
    data: CityRegionFilterDto
  ): Promise<CategoryInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);

    if (data.all) {
      const categories: any = await getOrderedData(
        'Category',
        'category',
        this.prisma,
        data
      );

      const formattedCategories = [];

      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const translations = category.CategoryTranslations;
        const name = formatLanguageResponse(translations);

        delete category.CategoryTranslations;

        if (category.city) {
          const cityTranslations = category.city.CityTranslations;
          const cityName = formatLanguageResponse(cityTranslations);

          delete category.city.CityTranslations;

          const regionTranslations = category.city.Region.RegionTranslations;
          const regionName = formatLanguageResponse(regionTranslations);

          delete category.city.Region.RegionTranslations;

          const region = { ...category.city.Region, name: regionName };
          delete category.city.Region;

          const city = { ...category.city, name: cityName };

          delete category.city;

          formattedCategories.push({ ...category, name, city, region });
        } else {
          formattedCategories.push({ ...category, name });
        }

        if (category.district) {

          const districtName = formatLanguageResponse(
            category.district.DistrictTranslations
          );
          const districtNewName = formatLanguageResponse(
            category.district.DistrictNewNameTranslations
          );
          const districtOldName = formatLanguageResponse(
            category.district.DistrictOldNameTranslations
          );

          const district = {
            name: districtName,
            newName: districtNewName,
            oldName: districtOldName,
          };
          delete category.district.DistrictTranslations;
          delete category.district.DistrictNewNameTranslations;
          delete category.district.DistrictOldNameTranslations;
          delete category.district;

          formattedCategories.push({ ...formattedCategories, district });
        }

      }

      this.logger.debug(
        `Method: ${methodName} -  Response: `,
        formattedCategories
      );

      return {
        data: formattedCategories,
        totalDocs: categories.length,
        totalPage: 1,
      };
    }

    const where: any = {
      ...(data.status == 2
        ? {}
        : {
            status: data.status,
          }),
      cityId: data.cityId,
      regionId: data.regionId,
    };
    if (data.search) {
      where.CategoryTranslations = {
        some: {
          name: {
            contains: data.search,
            mode: 'insensitive',
          },
        },
      };
    }
    const count = await this.prisma.category.count({ where });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const categories: any = await getOrderedData(
      'Category',
      'category',
      this.prisma,
      data,
      pagination
    );

    const formattedCategories = [];

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const translations = category.CategoryTranslations;
      const name = formatLanguageResponse(translations);

      delete category.CategoryTranslations;
      if (category.city) {
        const cityTranslations = category.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);

        delete category.city.CityTranslations;

        const regionTranslations = category.city.Region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);

        delete category.city.Region.RegionTranslations;

        const region = { ...category.city.Region, name: regionName };
        delete category.city.Region;

        const city = { ...category.city, name: cityName };

        delete category.city;

        formattedCategories.push({ ...category, name, city, region });
      } else {
        formattedCategories.push({ ...category, name });
      }
    }
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

  async findOne(data: GetOneDto): Promise<CategoryInterfaces.Response> {
    const methodName: string = this.findOne.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const category = await this.prisma.category.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: {
        city: {
          include: {
            CityTranslations: {
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
            Region: {
              include: {
                RegionTranslations: {
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
          },
        },
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
    });

    if (!category) {
      throw new NotFoundException('Category is not found');
    }

    const name = formatLanguageResponse(category.CategoryTranslations);

    this.logger.debug(`Method: ${methodName} - Response: `, category);
    delete category.CategoryTranslations;
    if (category.city) {
      const cityTranslations = category.city.CityTranslations;
      const cityName = formatLanguageResponse(cityTranslations);

      delete category.city.CityTranslations;

      const regionTranslations = category.city.Region.RegionTranslations;
      const regionName = formatLanguageResponse(regionTranslations);

      delete category.city.Region.RegionTranslations;

      const region = { ...category.city.Region, name: regionName };
      delete category.city.Region;

      const city = { ...category.city, name: cityName };

      delete category.city;

      return { ...category, name, city, region };
    } else {
      return { ...category, name };
    }
  }

  async update(data: CategoryUpdateDto): Promise<CategoryInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const category = await this.findOne({ id: data.id });

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

    const updatedCategory = await this.prisma.category.update({
      where: {
        id: category.id,
      },
      data: {
        staffNumber: data.staffNumber || category.staffNumber,
        cityId: data.cityId,
        regionId: data.regionId,
        orderNumber: data.orderNumber,
        CategoryTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
      },
      include: {
        CategoryTranslations: true,
        city: {
          include: {
            CityTranslations: {
              select: {
                languageCode: true,
                name: true,
              },
            },
            Region: {
              include: {
                RegionTranslations: {
                  select: {
                    languageCode: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updatedCategory);

    return updatedCategory;
  }

  async remove(data: DeleteDto): Promise<CategoryInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    if (data.delete) {
      const category = await this.prisma.category.delete({
        where: { id: data.id },
        include: {
          CategoryTranslations: {
            select: {
              languageCode: true,
              name: true,
            },
          },
          city: {
            include: {
              CityTranslations: {
                select: {
                  languageCode: true,
                  name: true,
                },
              },
              Region: {
                include: {
                  RegionTranslations: {
                    select: {
                      languageCode: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      this.logger.debug(
        `Method: ${methodName} - Rresponse when delete true: `,
        category
      );

      return category;
    }

    const category = await this.prisma.category.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
      include: {
        CategoryTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        city: {
          include: {
            CityTranslations: {
              select: {
                languageCode: true,
                name: true,
              },
            },
            Region: {
              include: {
                RegionTranslations: {
                  select: {
                    languageCode: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    this.logger.debug(
      `Method: ${methodName} - Rresponse when delete false: `,
      category
    );

    return category;
  }

  async restore(data: GetOneDto): Promise<CategoryInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const category = this.prisma.category.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
      include: {
        CategoryTranslations: {
          select: {
            languageCode: true,
            name: true,
          },
        },
        city: {
          include: {
            CityTranslations: {
              select: {
                languageCode: true,
                name: true,
              },
            },
            Region: {
              include: {
                RegionTranslations: {
                  select: {
                    languageCode: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    this.logger.debug(`Method: ${methodName} - Rresponse: `, category);

    return category;
  }
}
