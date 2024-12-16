import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatedByEnum,
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  LanguageRequestEnum,
  ListQueryDto,
  OrganizationStatusEnum,
  OrganizationVersionActionsEnum,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { createPagination } from '@/common/helper/pagination.helper';
import { RegionService } from '../region/region.service';
import { CityService } from '../city/city.service';
import { DistrictService } from '../district/district.service';
import { MainOrganizationService } from '../main-organization/main-organization.service';
import { SubCategoryService } from '../sub-category/sub-category.service';
import { ProductServiceCategoryService } from '../product-servise-category/product-service-category.service';
import { ProductServiceSubCategoryService } from '../product-service-sub-category/product-service-sub-category.service';
import { VillageService } from '../village/village.service';
import { AvenueService } from '../avenue/avenue.service';
import { ResidentialAreaService } from '../residential-area/residential-area.service';
import { AreaService } from '../area/area.service';
import { LaneService } from '../lane/lane.service';
import { StreetService } from '../street/street.service';
import { ImpasseService } from '../impasse/impasse.service';
import { NearbyService } from '../nearby/nearby.service';
import { SegmentService } from '../segment/segment.service';
import { SectionService } from '../section/section.service';
import {
 OrganizationVersionInterfaces,
} from 'types/organization/organization-version';


@Injectable()
export class OrganizationVersionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mainOrganizationService: MainOrganizationService,
    private readonly subCategoryService: SubCategoryService,
    private readonly productServiceCategoryService: ProductServiceCategoryService,
    private readonly productServiceSubCategoryService: ProductServiceSubCategoryService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService,
    private readonly VillageService: VillageService,
    private readonly AvenueService: AvenueService,
    private readonly ResidentialAreaService: ResidentialAreaService,
    private readonly AreaService: AreaService,
    private readonly StreetService: StreetService,
    private readonly LaneService: LaneService,
    private readonly ImpasseService: ImpasseService,
    private readonly NearbyService: NearbyService,
    private readonly SegmentService: SegmentService,
    private readonly SectionService: SectionService
  ) {}

  async create(
    data: OrganizationVersionInterfaces.Request
  ): Promise<any> {


    let phones = data.phone;
  const updatedPhones = [];

  for (const phone of phones) {
    updatedPhones.push({
      ...phone,
      action: OrganizationVersionActionsEnum.GET , // Qo'shmoqchi bo'lgan action qiymatini bu yerda yozasiz
    });
    }
    const updatedPictures = [];
    let pictures = data.Picture;

    for (const picture of pictures) {
      updatedPictures.push({
        ...picture,
        action: OrganizationVersionActionsEnum.GET, // Bu yerda action qiymatini belgilang
      });
    }
    

    console.log(data, 'DATA Organization');
    

    const organization = await this.prisma.organizationVersion.create({
      data: {
        regionId: data.regionId,
        cityId: data.cityId,
        districtId: data.districtId,
        villageId: data.villageId,
        avenueId: data.avenueId,
        residentialId: data.residentialId,
        areaId: data.areaId,
        streetId: data.streetId,
        laneId: data.laneId,
        impasseId: data.impasseId,
        nearbyId: data.nearbyId,
        segmentId: data.segmentId,
        sectionId: data.sectionId,
        mainOrganizationId: data.mainOrganizationId,
        subCategoryId: data.subCategoryId,
        productServiceCategoryId: data.productServiceCategoryId,
        productServiceSubCategoryId: data.productServiceSubCategoryId,
        account: data.account,
        bank_number: data.bank_number,
        address: data.address,
        apartment: data.apartment,
        home: data.home,
        clientId: data.clientId,
        inn: data.inn,
        kvartal: data.kvartal,
        legalName: data.legalName,
        mail: data.mail,
        name: data.name,
        secret: data.secret,
        nearbyDescription: data.nearbyDescription,
        maneger: data.maneger,
        index: data.index,
        transport: data.transport,
        workTime: data.workTime,
        staffNumber: data.staffNumber,
        status: data.status,
        createdBy: data.createdBy,
        PaymentTypesVersion: {
          create: [
            {
              paymentAction: 'create',
              Cash: data.paymentTypes.cash,
              Terminal: data.paymentTypes.terminal,
              Transfer: data.paymentTypes.transfer,
            },
          ],
        }, 
        PhoneVersion: {
          create: updatedPhones,
        },
        PictureVersion: {
          create: updatedPictures,
        },
      },
      include: {
        PaymentTypesVersion: true,
        PhoneVersion: true,
        PictureVersion: true,
      },
    });

    // return organization;
  }

  async findAll(
    data: LanguageRequestDto
  ): Promise<OrganizationVersionInterfaces.ResponseWithoutPagination> {
    const organizations = await this.prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        Picture: {
          select: {
            id: true,
            link: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        PaymentTypes: {
          select: {
            id: true,
            Cash: true,
            Terminal: true,
            Transfer: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        Phone: {
          select: {
            id: true,
            phone: true,
            PhoneTypeId: true,
            createdAt: true,
            updatedAt: true,
            PhoneTypes: {
              select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                staffNumber: true,
              },
            },
          },
        },
      },
    });

    return {
      data: organizations,
      totalDocs: organizations.length,
    };
  }

  async findAllByPagination(
    data: ListQueryDto
  ): Promise<OrganizationVersionInterfaces.ResponseWithPagination> {
    const where: any = { status: DefaultStatus.ACTIVE };
    if (data.search) {
      where.StreetTranslations = {
        some: {
          languageCode: data.lang_code,
          name: {
            contains: data.search,
          },
        },
      };
    }
    const count = await this.prisma.street.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const streets = await this.prisma.street.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        StreetTranslations: {
          where: data.all_lang
            ? {}
            : {
                languageCode: data.lang_code,
              },
          select: {
            name: true,
            languageCode: true,
          },
        },
        StreetNewNameTranslations: {
          where: data.all_lang
            ? {}
            : {
                languageCode: data.lang_code,
              },
          select: {
            name: true,
            languageCode: true,
          },
        },
        StreetOldNameTranslations: {
          where: data.all_lang
            ? {}
            : {
                languageCode: data.lang_code,
              },
          select: {
            name: true,
            languageCode: true,
          },
        },
      },
      take: pagination.take,
      skip: pagination.skip,
    });

    const formattedStreet = [];

    for (let i = 0; i < streets.length; i++) {
      const streetData = streets[i];
      const translations = streetData.StreetTranslations;
      const name = formatLanguageResponse(translations);
      const translationsNew = streetData.StreetNewNameTranslations;
      const nameNew = formatLanguageResponse(translationsNew);
      const translationsOld = streetData.StreetOldNameTranslations;
      const nameOld = formatLanguageResponse(translationsOld);

      delete streetData.StreetTranslations;
      delete streetData.StreetNewNameTranslations;
      delete streetData.StreetOldNameTranslations;

      formattedStreet.push({
        ...streetData,
        name,
        new_name: nameNew,
        old_name: nameOld,
      });
    }

    return {
      data: formattedStreet,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(
    data: GetOneDto
  ): Promise<OrganizationVersionInterfaces.Response> {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id: data.id,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        Picture: {
          select: {
            id: true,
            link: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        PaymentTypes: {
          select: {
            id: true,
            Cash: true,
            Terminal: true,
            Transfer: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        Phone: {
          select: {
            id: true,
            phone: true,
            PhoneTypeId: true,
            createdAt: true,
            updatedAt: true,
            PhoneTypes: {
              select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                staffNumber: true,
              },
            },
          },
        },
      },
    });
    if (!organization) {
      throw new NotFoundException('Street is not found');
    }

    return { ...organization };
  }

  // async update(
  //   data: OrganizationUpdateDto
  // ): Promise<OrganizationInterfaces.Response> {
  //   const street = await this.findOne({ id: data.id });

  //   if (data.regionId) {
  //     await this.regionService.findOne({ id: data.regionId });
  //   }

  //   if (data.cityId) {
  //     await this.cityService.findOne({ id: data.cityId });
  //   }

  //   if (data.districtId) {
  //     await this.districtService.findOne({ id: data.districtId });
  //   }

  //   const translationUpdates = [];
  //   const translationNewNameUpdates = [];
  //   const translationOldNameUpdates = [];

  //   if (data.name?.[LanguageRequestEnum.RU]) {
  //     translationUpdates.push({
  //       where: { languageCode: LanguageRequestEnum.RU },
  //       data: { name: data.name[LanguageRequestEnum.RU] },
  //     });
  //   }

  //   if (data.name?.[LanguageRequestEnum.UZ]) {
  //     translationUpdates.push({
  //       where: { languageCode: LanguageRequestEnum.UZ },
  //       data: { name: data.name[LanguageRequestEnum.UZ] },
  //     });
  //   }

  //   if (data.name?.[LanguageRequestEnum.CY]) {
  //     translationUpdates.push({
  //       where: { languageCode: LanguageRequestEnum.CY },
  //       data: { name: data.name[LanguageRequestEnum.CY] },
  //     });
  //   }

  //   // return await this.prisma.street.update({
  //   //   where: {
  //   //     id: street.id,
  //   //   },
  //   //   data: {
  //   //     regionId: data.regionId || street.regionId,
  //   //     cityId: data.cityId || street.cityId,
  //   //     districtId: data.districtId || street.districtId,
  //   //     staffNumber: data.staffNumber || street.staffNumber,
  //   //     StreetTranslations: {
  //   //       updateMany:
  //   //         translationUpdates.length > 0 ? translationUpdates : undefined,
  //   //     },
  //   //     StreetNewNameTranslations: {
  //   //       updateMany:
  //   //         translationNewNameUpdates.length > 0
  //   //           ? translationNewNameUpdates
  //   //           : undefined,
  //   //     },
  //   //     StreetOldNameTranslations: {
  //   //       updateMany:
  //   //         translationOldNameUpdates.length > 0
  //   //           ? translationOldNameUpdates
  //   //           : undefined,
  //   //     },
  //   //   },
  //   //   include: {
  //   //     StreetTranslations: true,
  //   //     StreetNewNameTranslations: true,
  //   //     StreetOldNameTranslations: true,
  //   //   },
  //   // });
  // }

  // async remove(data: DeleteDto): Promise<OrganizationInterfaces.Response> {
  //   if (data.delete) {
  //     return await this.prisma.street.delete({
  //       where: { id: data.id },
  //       include: {
  //         StreetTranslations: {
  //           select: {
  //             languageCode: true,
  //             name: true,
  //           },
  //         },
  //         StreetNewNameTranslations: {
  //           select: {
  //             languageCode: true,
  //             name: true,
  //           },
  //         },
  //         StreetOldNameTranslations: {
  //           select: {
  //             languageCode: true,
  //             name: true,
  //           },
  //         },
  //       },
  //     });
  //   }

  //   return await this.prisma.street.update({
  //     where: { id: data.id, status: DefaultStatus.ACTIVE },
  //     data: { status: DefaultStatus.INACTIVE },
  //     include: {
  //       StreetTranslations: {
  //         select: {
  //           languageCode: true,
  //           name: true,
  //         },
  //       },
  //       StreetNewNameTranslations: {
  //         select: {
  //           languageCode: true,
  //           name: true,
  //         },
  //       },
  //       StreetOldNameTranslations: {
  //         select: {
  //           languageCode: true,
  //           name: true,
  //         },
  //       },
  //     },
  //   });
  // }

  // async restore(data: GetOneDto): Promise<OrganizationInterfaces.Response> {
  //   return this.prisma.street.update({
  //     where: {
  //       id: data.id,
  //       status: DefaultStatus.INACTIVE,
  //     },
  //     data: { status: DefaultStatus.ACTIVE },
  //     include: {
  //       StreetTranslations: {
  //         select: {
  //           languageCode: true,
  //           name: true,
  //         },
  //       },
  //       StreetNewNameTranslations: {
  //         select: {
  //           languageCode: true,
  //           name: true,
  //         },
  //       },
  //       StreetOldNameTranslations: {
  //         select: {
  //           languageCode: true,
  //           name: true,
  //         },
  //       },
  //     },
  //   });
  // }
}
