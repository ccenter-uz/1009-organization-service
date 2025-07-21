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
  GetOneSavedOrganizationDto,
  SavedOrganizationFilterDto
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
import { getOrgOptimizedQuery } from '@/common/helper/for-Org/get-org';

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

    //   const findSavedOrganization = await this.findOne({
    //     id: data.organizationId,
    //     userId: data.userId,
    //   });
    // console.log(findSavedOrganization, 'findSavedOrganization');

    // if (findSavedOrganization) {
    //   console.log('eroor');

    //   throw new NotFoundException('Saved Organization is already exist');
    // }

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
    data: SavedOrganizationFilterDto
  ): Promise<savedOrganizationInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const organization: any = await getOrgOptimizedQuery(
      this.prisma,
      data,
      data.page,
      data.limit
    );

    this.logger.debug(`Method: ${methodName} - Response: `, organization);


    return organization;
  }

  async findOne(
    data: GetOneSavedOrganizationDto
  ): Promise<savedOrganizationInterfaces.Response> {
    const methodName: string = this.findOne.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const savedOrganization = await this.prisma.savedOrganization.findFirst({
      where: {
        organizationId: data.id,
        userId: data.userId,
        status: DefaultStatus.ACTIVE,
      },
    });

    if (!savedOrganization) {
      throw new NotFoundException('Saved Organization is not found');
    }

    this.logger.debug(`Method: ${methodName} - Response: `, savedOrganization);
    return savedOrganization;
  }

  async update(
    data: savedOrganizationUpdateDto
  ): Promise<savedOrganizationInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const findSavedOrganization = await this.findOne({
      id: data.id,
      userId: data.userId,
    });

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
