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
  SavedOrganizationCreateDto,
  savedOrganizationInterfaces,
  savedOrganizationUpdateDto,
} from 'types/organization/saved-organization';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestEnum,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { CityRegionFilterDto } from 'types/global/dto/city-region-filter.dto';
import { Prisma } from '@prisma/client';
import { CacheService } from '../cache/cache.service';

import { savedOrganizationDeleteDto } from 'types/organization/saved-organization/dto/delete-saved-organization.dto';

@Injectable()
export class SavedOrganizationService {
  private logger = new Logger(SavedOrganizationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService
  ) {}

  async create(
    data: SavedOrganizationCreateDto
  ): Promise<savedOrganizationInterfaces.Response> {
    const methodName: string = this.create.name;
    console.log(data, 'DATA');

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const savedOrganization = await this.prisma.savedOrganization.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        isSaved: data.isSaved,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, data);
    // await this.cacheService.invalidateAllCaches('category');
    return savedOrganization;
  }

  async findAll(
    data: CityRegionFilterDto
  ): Promise<savedOrganizationInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    // const CacheKey = formatCacheKey(data);
    // const findCategores = await this.cacheService.get('category', CacheKey);
    // if (findCategores) {
    //   return findCategores;
    // } else {
    if (data.all) {
      // const categories: any = await getCategoryData(
      //   'Category',
      //   'category',
      //   this.prisma,
      //   data
      // );

      const savedOrganizations = await this.prisma.savedOrganization.findMany({
        where: {
          // status: data.status,
        },
      });

      this.logger.debug(
        `Method: ${methodName} -  Response: `,
        savedOrganizations
      );
      // await this.cacheService.setAll('category', CacheKey, {
      //   data: categories,
      //   totalDocs: categories.length,
      //   totalPage: categories.length > 0 ? 1 : 0,
      // });
      return {
        data: savedOrganizations,
        totalDocs: savedOrganizations.length,
        totalPage: savedOrganizations.length > 0 ? 1 : 0,
      };
    }

    const where: any = {
      ...(data.status == 2
        ? {}
        : {
            status: data.status,
          }),
    };

    const count = await this.prisma.savedOrganization.count({ where });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const savedOrganizations = await this.prisma.savedOrganization.findMany({
      where: {
        // status: data.status,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, savedOrganizations);

    // await this.cacheService.setAll('category', CacheKey, {
    //   data: categories,
    //   totalPage: pagination.totalPage,
    //   totalDocs: count,
    // });
    return {
      data: savedOrganizations,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
    // }
  }

  async findOne(
    data: GetOneDto
  ): Promise<savedOrganizationInterfaces.Response> {
    const methodName: string = this.findOne.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    // const findCategory = await this.cacheService.get(
    //   'categoryOne',
    //   data.id?.toString()
    // );
    // if (findCategory) {
    //   console.log(findCategory, 'findCategory');
    //   return findCategory;
    // } else {
    const savedOrganization = await this.prisma.savedOrganization.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
    });

    if (!savedOrganization) {
      throw new NotFoundException('Saved Organization is not found');
    }

    this.logger.debug(`Method: ${methodName} - Response: `, savedOrganization);

    // await this.cacheService.set(
    //   'categoryOne',
    //   data.id?.toString(),
    //   formatedRespons
    // );
    return savedOrganization;
    // }
  }

  async update(
    data: savedOrganizationUpdateDto
  ): Promise<savedOrganizationInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const findSavedOrganization = await this.findOne({ id: data.id });

    const updatedCategory = await this.prisma.savedOrganization.update({
      where: {
        id: findSavedOrganization.id,
      },
      data: {
        userId: data.userId,
        isSaved: data.isSaved,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, updatedCategory);
    // await this.cacheService.delete('categoryOne', data.id?.toString());
    // await this.cacheService.invalidateAllCaches('category');
    return updatedCategory;
  }

  async remove(
    data: savedOrganizationDeleteDto
  ): Promise<savedOrganizationInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    if (data.delete) {
      const savedOrganization = await this.prisma.savedOrganization.delete({
        where: { id: data.id },
      });

      this.logger.debug(
        `Method: ${methodName} - Rresponse when delete true: `,
        savedOrganization
      );
      // await this.cacheService.delete('categoryOne', data.id?.toString());
      // await this.cacheService.invalidateAllCaches('category');
      return savedOrganization;
    }

    const savedOrgnization = await this.prisma.savedOrganization.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
    });

    this.logger.debug(
      `Method: ${methodName} - Rresponse when delete false: `,
      savedOrgnization
    );
    // await this.cacheService.delete('categoryOne', data.id?.toString());
    // await this.cacheService.invalidateAllCaches('category');
    return savedOrgnization;
  }

  async restore(
    data: GetOneDto
  ): Promise<savedOrganizationInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const savedOrganization = this.prisma.savedOrganization.update({
      where: {
        id: data.id,
        status: DefaultStatus.INACTIVE,
      },
      data: { status: DefaultStatus.ACTIVE },
    });

    this.logger.debug(`Method: ${methodName} - Rresponse: `, savedOrganization);
    // await this.cacheService.invalidateAllCaches('category');
    return savedOrganization;
  }
}
