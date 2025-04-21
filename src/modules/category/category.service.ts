import {
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
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
import { CacheService } from '../cache/cache.service';
import { formatCacheKey } from '@/common/helper/format-cache-maneger';
import { getCategoryData } from '@/common/helper/sql-rows-for-select/get-category';
import { CategoryDeleteDto } from 'types/organization/category/dto/delete-category.dto';
import { SubCategoryService } from '../sub-category/sub-category.service';

@Injectable()
export class CategoryService {
  private logger = new Logger(CategoryService.name);

  constructor(
    @Inject(forwardRef(() => SubCategoryService))
    private readonly SubCategoryService: SubCategoryService,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService
  ) {}

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
          },
        },
        region: {
          include: {
            RegionTranslations: {
              select: {
                languageCode: true,
                name: true,
              },
            },
          },
        },
        district: {
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
    });

    this.logger.debug(`Method: ${methodName} - Response: `, data);
    await this.cacheService.invalidateAllCaches('category');
    return category;
  }

  async findAll(
    data: CityRegionFilterDto
  ): Promise<CategoryInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const CacheKey = formatCacheKey(data);
    const findCategores = await this.cacheService.get('category', CacheKey);
    if (findCategores) {
      return findCategores;
    } else {
      if (data.all) {
        const categories: any = await getOrderedData(
          'Category',
          'category',
          this.prisma,
          data
        );

        const formattedCategories = [];

        for (let i = 0; i < categories.length; i++) {
          let category = categories[i];
          const translations = category.CategoryTranslations;
          const name = formatLanguageResponse(translations);
          category = { ...category, name };
          delete category.CategoryTranslations;

          if (category.city) {
            const cityTranslations = category.city.CityTranslations;
            const cityName = formatLanguageResponse(cityTranslations);

            delete category.city.CityTranslations;

            const city = { ...category.city, name: cityName };

            delete category.CityTranslations;

            category = { ...category, city };
          }
          if (category.region) {
            const regionTranslations = category.region.RegionTranslations;
            const regionName = formatLanguageResponse(regionTranslations);

            const region = { ...category.region, name: regionName };

            category = { ...category, region };
            delete category.region.RegionTranslations;
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
              ...category.district,
              name: districtName,
              newName: districtNewName,
              oldName: districtOldName,
            };
            category = { ...category, district };
            delete category.district.DistrictTranslations;
            delete category.district.DistrictNewNameTranslations;
            delete category.district.DistrictOldNameTranslations;
          }
          formattedCategories.push(category);
        }

        this.logger.debug(
          `Method: ${methodName} -  Response: `,
          formattedCategories
        );
        await this.cacheService.setAll('category', CacheKey, {
          data: formattedCategories,
          totalDocs: categories.length,
          totalPage: categories.length > 0 ? 1 : 0,
        });
        return {
          data: formattedCategories,
          totalDocs: categories.length,
          totalPage: categories.length > 0 ? 1 : 0,
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
        districtId: data.districtId,
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
        let category = categories[i];
        const translations = category.CategoryTranslations;
        const name = formatLanguageResponse(translations);
        category = { ...category, name };
        delete category.CategoryTranslations;

        if (category.city) {
          const cityTranslations = category.city.CityTranslations;
          const cityName = formatLanguageResponse(cityTranslations);

          delete category.city.CityTranslations;

          const city = { ...category.city, name: cityName };

          delete category.CityTranslations;

          category = { ...category, city };
        }
        if (category.region) {
          const regionTranslations = category.region.RegionTranslations;
          const regionName = formatLanguageResponse(regionTranslations);

          const region = { ...category.region, name: regionName };

          category = { ...category, region };
          delete category.region.RegionTranslations;
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
            ...category.district,
            name: districtName,
            newName: districtNewName,
            oldName: districtOldName,
          };
          category = { ...category, district };
          delete category.district.DistrictTranslations;
          delete category.district.DistrictNewNameTranslations;
          delete category.district.DistrictOldNameTranslations;
        }
        formattedCategories.push(category);
      }
      this.logger.debug(`Method: ${methodName} - Response: `, categories[0]);

      console.log(pagination.totalPage, 'TOTAL PAGE');
      console.log(count, 'COUNT');

      await this.cacheService.setAll('category', CacheKey, {
        data: formattedCategories,
        totalPage: pagination.totalPage,
        totalDocs: count,
      });
      return {
        data: formattedCategories,
        totalPage: pagination.totalPage,
        totalDocs: count,
      };
    }
  }

  async findOne(data: GetOneDto): Promise<CategoryInterfaces.Response> {
    const methodName: string = this.findOne.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const findCategory = await this.cacheService.get(
      'categoryOne',
      data.id?.toString()
    );
    if (findCategory) {
      console.log(findCategory, 'findCategory');

      return findCategory;
    } else {
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
            },
          },
          region: {
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
          district: {
            include: {
              DistrictTranslations: {
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
              DistrictNewNameTranslations: {
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
              DistrictOldNameTranslations: {
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

      let formatedRespons: CategoryInterfaces.Response = { ...category, name };
      if (category.city) {
        const cityTranslations = category.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);

        delete category.city.CityTranslations;

        const city = { ...category.city, name: cityName };

        formatedRespons = { ...formatedRespons, city };
      }
      if (category.region) {
        const regionTranslations = category.region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);

        delete formatedRespons.region?.['RegionTranslations'];
        delete category.region.RegionTranslations;
        const region = { ...category.region, name: regionName };

        formatedRespons = { ...formatedRespons, region };
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

        delete category.district.DistrictTranslations;
        delete category.district.DistrictNewNameTranslations;
        delete category.district.DistrictOldNameTranslations;

        let district = {
          ...formatedRespons.district,
          name: districtName,
          oldName: districtOldName,
          newName: districtNewName,
        };
        delete formatedRespons.district;
        formatedRespons = { ...formatedRespons, district };
      }

      await this.cacheService.set(
        'categoryOne',
        data.id?.toString(),
        formatedRespons
      );
      return formatedRespons;
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
        editedStaffNumber: data.staffNumber,
        cityId: data.cityId,
        regionId: data.regionId,
        districtId: data.districtId,
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
          },
        },
        region: {
          include: {
            RegionTranslations: {
              select: {
                languageCode: true,
                name: true,
              },
            },
          },
        },
        district: {
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
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updatedCategory);
    await this.cacheService.delete('categoryOne', data.id?.toString());
    await this.cacheService.invalidateAllCaches('category');
    return updatedCategory;
  }

  async remove(data: CategoryDeleteDto): Promise<CategoryInterfaces.Response> {
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
            },
          },
          region: {
            include: {
              RegionTranslations: {
                select: {
                  languageCode: true,
                  name: true,
                },
              },
            },
          },
          district: {
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
      });
      const findSubCategory = await this.SubCategoryService.findAll({
        categoryId: data.id,
        all: true,
        status: 1,
        page: 1,
        limit: 100,
      });

      for (const subCategory of findSubCategory.data) {
        await this.SubCategoryService.remove({
          id: subCategory.id,
          delete: data.delete,
        });
      }

      this.logger.debug(
        `Method: ${methodName} - Rresponse when delete true: `,
        category
      );
      await this.cacheService.delete('categoryOne', data.id?.toString());
      await this.cacheService.invalidateAllCaches('category');
      return category;
    }

    const category = await this.prisma.category.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE, deleteReason: data.deleteReason },
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
          },
        },
        region: {
          include: {
            RegionTranslations: {
              select: {
                languageCode: true,
                name: true,
              },
            },
          },
        },
        district: {
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
    });

    const findSubCategory = await this.SubCategoryService.findAll({
      categoryId: data.id,
      all: true,
      status: 1,
      page: 1,
      limit: 100,
    });

    for (const subCategory of findSubCategory.data) {
      await this.SubCategoryService.remove({
        id: subCategory.id,
        delete: data.delete,
      });
    }

    this.logger.debug(
      `Method: ${methodName} - Rresponse when delete false: `,
      category
    );
    await this.cacheService.delete('categoryOne', data.id?.toString());
    await this.cacheService.invalidateAllCaches('category');
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
          },
        },
        region: {
          include: {
            RegionTranslations: {
              select: {
                languageCode: true,
                name: true,
              },
            },
          },
        },
        district: {
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
    });

    this.logger.debug(`Method: ${methodName} - Rresponse: `, category);
    await this.cacheService.invalidateAllCaches('category');
    return category;
  }
}
