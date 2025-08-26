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
  SavedOrganizationFilterDto,
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

    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const savedOrganization = await this.prisma.savedOrganization.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        isSaved: data.isSaved,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, data);
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
    console.log(savedOrganization);
    

    if (!savedOrganization) {
      console.log(savedOrganization);
      
      throw new NotFoundException('Saved Organization is not found');
    }

    this.logger.debug(`Method: ${methodName} - Response: `, savedOrganization);
    return savedOrganization;
  }

  async remove(
    data: savedOrganizationDeleteDto
  ): Promise<savedOrganizationInterfaces.Response> {
    const methodName: string = this.remove.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const findSaved = await this.findOne({ id: data.id, userId: data.userId });

    const savedOrganization = await this.prisma.savedOrganization.delete({
      where: {
        id: findSaved.id,
      },
    });

    this.logger.debug(
      `Method: ${methodName} - Rresponse when delete true: `,
      savedOrganization
    );

    return savedOrganization;
  }
}
