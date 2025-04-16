import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { createPagination } from '@/common/helper/pagination.helper';
import { PrismaService } from '@/modules/prisma/prisma.service';

import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  LanguageRequestEnum,
  ListQueryDto,
} from 'types/global';
import {
  MainOrganizationCreateDto,
  MainOrganizationInterfaces,
  MainOrganizationUpdateDto,
} from 'types/organization/main-organization';
import { ListQueryWithOrderDto } from 'types/global/dto/list-query-with-order.dto';
import { getSingleData } from '@/common/helper/sql-rows-for-select/get-single-data.dto';
import { Prisma } from '@prisma/client';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { getSingleOrderedData } from '@/common/helper/sql-rows-for-select/get-single-ordered-data.dto';
@Injectable()
export class MainOrganizationService {
  private logger = new Logger(MainOrganizationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: MainOrganizationCreateDto
  ): Promise<MainOrganizationInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const mainOrganization = await this.prisma.mainOrganization.create({
      data: {
        staffNumber: data.staffNumber,
        MainOrganizationTranslations: {
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
        orderNumber: data.orderNumber,
      },
      include: {
        MainOrganizationTranslations: true,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, mainOrganization);

    return mainOrganization;
  }

  async findAll(
    data: ListQueryWithOrderDto
  ): Promise<MainOrganizationInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const conditions: Prisma.Sql[] = [];
    if (data.status === 0 || data.status === 1)
      conditions.push(Prisma.sql`c.status = ${data.status}`);
    if (data.search) {
      conditions.push(Prisma.sql`
              EXISTS (
                SELECT 1
                FROM main_organization_translations ct
                WHERE ct.main_organization_id = c.id
                  AND ct.name ILIKE ${`%${data.search}%`}
                ORDER BY ct.language_code   
                LIMIT 1
              )
            `);
    }
    if (data.all) {
      const mainOrganization = await getSingleOrderedData(
        'MainOrganization',
        'main_organization',
        this.prisma,
        data,
        conditions
      );

      console.log(mainOrganization, 'mainOrganization');

      const formattedCategories = [];

      for (let i = 0; i < mainOrganization.length; i++) {
        const mainOrg = mainOrganization[i];
        const translations = mainOrg?.MainOrganizationTranslations;
        const name = formatLanguageResponse(translations);

        delete mainOrg.MainOrganizationTranslations;

        formattedCategories.push({ ...mainOrg, name });
      }

      this.logger.debug(
        `Method: ${methodName} - Response: `,
        formattedCategories
      );

      return {
        data: formattedCategories,
        totalDocs: mainOrganization.length,
        totalPage: mainOrganization.length > 0 ? 1 : 0,
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
      where.name = {
        contains: data.search,
        mode: 'insensitive',
      };
    }
    const count = await this.prisma.mainOrganization.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const mainOrganization = await getSingleOrderedData(
      'MainOrganization',
      'main_organization',
      this.prisma,
      data,
      conditions,
      pagination
    );
    const formattedCategories = [];
    for (let i = 0; i < mainOrganization.length; i++) {
      const mainOrg = mainOrganization[i];
      const translations = mainOrg?.MainOrganizationTranslations;
      const name = formatLanguageResponse(translations);
      console.log(name, 'name', translations, 'translations');

      delete mainOrg.MainOrganizationTranslations;

      formattedCategories.push({ ...mainOrg, name });
    }

    this.logger.debug(
      `Method: ${methodName} -  Response: `,
      formattedCategories
    );
    return {
      data: formattedCategories,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<MainOrganizationInterfaces.Response> {
    const methodName: string = this.findOne.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const mainOrganization = await this.prisma.mainOrganization.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
    });

    if (!mainOrganization) {
      throw new NotFoundException('Main Organization is not found');
    }
    this.logger.debug(`Method: ${methodName} - Response: `, mainOrganization);
    return mainOrganization;
  }

  async update(
    data: MainOrganizationUpdateDto
  ): Promise<MainOrganizationInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const mainOrganization = await this.findOne({ id: data.id });

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

    const updatedMainOrganization = await this.prisma.mainOrganization.update({
      where: {
        id: mainOrganization.id,
      },
      data: {
        editedStaffNumber: data.staffNumber,
        MainOrganizationTranslations: {
          updateMany:
            translationUpdates.length > 0 ? translationUpdates : undefined,
        },
        orderNumber: data.orderNumber,
      },
      include: {
        MainOrganizationTranslations: true,
      },
    });

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedMainOrganization
    );

    return updatedMainOrganization;
  }

  async remove(data: DeleteDto): Promise<MainOrganizationInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (data.delete) {
      const deletedMainOrganization = await this.prisma.mainOrganization.delete(
        {
          where: { id: data.id },
        }
      );

      this.logger.debug(
        `Method: ${methodName} - Response: `,
        deletedMainOrganization
      );

      return deletedMainOrganization;
    }

    const updatedMainOrganization = await this.prisma.mainOrganization.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
    });

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedMainOrganization
    );

    return updatedMainOrganization;
  }

  async restore(data: GetOneDto): Promise<MainOrganizationInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const updatedMainOrganization = this.prisma.mainOrganization.update({
      where: { id: data.id, status: DefaultStatus.INACTIVE },
      data: { status: DefaultStatus.ACTIVE },
    });

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      updatedMainOrganization
    );

    return updatedMainOrganization;
  }
}
