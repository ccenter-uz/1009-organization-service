import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatedByEnum,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
  OrganizationStatusEnum,
} from 'types/global';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { createPagination } from '@/common/helper/pagination.helper';
import { RegionService } from '../region/region.service';
import { CityService } from '../city/city.service';
import { DistrictService } from '../district/district.service';
import {
  OrganizationCreateDto,
  OrganizationInterfaces,
} from 'types/organization/organization';
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
import { OrganizationVersionService } from '../organization-version/organization-version.service';

@Injectable()
export class OrganizationService {
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
    private readonly SectionService: SectionService,
    private readonly organizationVersionService: OrganizationVersionService
  ) {}

  async create(
    data: OrganizationCreateDto
  ): Promise<OrganizationInterfaces.Response> {
    const mainOrganization = await this.mainOrganizationService.findOne({
      id: data.mainOrganizationId,
    });
    const subCategory = await this.subCategoryService.findOne({
      id: data.subCategoryId,
    });
    const productServiceCategory =
      await this.productServiceCategoryService.findOne({
        id: data.productServiceCategoryId,
      });
    const productServiceSubCategory =
      await this.productServiceSubCategoryService.findOne({
        id: data.productServiceSubCategoryId,
      });
    const region = await this.regionService.findOne({
      id: data.regionId,
    });
    const city = await this.cityService.findOne({
      id: data.cityId,
    });
    const district = await this.districtService.findOne({
      id: data.districtId,
    });

    const village = await this.VillageService.findOne({
      id: data.villageId,
    });
    const avenue = await this.AvenueService.findOne({
      id: data.avenueId,
    });
    const residential = await this.ResidentialAreaService.findOne({
      id: data.residentialId,
    });

    const area = await this.AreaService.findOne({
      id: data.areaId,
    });
    const street = await this.StreetService.findOne({
      id: data.streetId,
    });
    const lane = await this.LaneService.findOne({
      id: data.laneId,
    });

    const impasse = await this.ImpasseService.findOne({
      id: data.impasseId,
    });
    const nearby = await this.NearbyService.findOne({
      id: data.nearbyId,
    });
    const segment = await this.SegmentService.findOne({
      id: data.segmentId,
    });

    const section = await this.SectionService.findOne({
      id: data.sectionId,
    });

    let phoneCreateArray = [];
    let phones = data.phone['phones'];
    for (let i = 0; i < phones?.length; i++) {
      phoneCreateArray.push({
        phone: phones[i].phone,
        PhoneTypeId: phones[i].phoneId, // Yoki kerakli qiymatni qo'shish
      });
    }

    console.log({ b: 'asdasdasdasdasd' });

    const organization = await this.prisma.organization.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        districtId: district.id,
        villageId: village.id,
        avenueId: avenue.id,
        residentialId: residential.id,
        areaId: area.id,
        streetId: street.id,
        laneId: lane.id,
        impasseId: impasse.id,
        nearbyId: nearby.id,
        segmentId: segment.id,
        sectionId: section.id,
        mainOrganizationId: mainOrganization.id,
        subCategoryId: subCategory.id,
        productServiceCategoryId: productServiceCategory.id,
        productServiceSubCategoryId: productServiceSubCategory.id,
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
        status:
          data.role == CreatedByEnum.Moderator
            ? OrganizationStatusEnum.Accepted
            : OrganizationStatusEnum.Check,
        createdBy:
          data.role == CreatedByEnum.Moderator
            ? CreatedByEnum.Moderator
            : CreatedByEnum.Client,
        PaymentTypes: {
          create: [
            {
              Cash: data.paymentTypes.cash,
              Terminal: data.paymentTypes.terminal,
              Transfer: data.paymentTypes.transfer,
            },
          ],
        },
        Phone: {
          create: [
            { phone: '+998901234567', PhoneTypeId: 1 },
            { phone: '+998907654321', PhoneTypeId: 1 },
          ],
        },
        Picture: {
          create: data.PhotoLink,
        },
      },
    });

    console.log({ a: 'asdasdasdasdasd' });

    // this.organizationVersionService.create(organization);

    return organization;
  }

  async findAll(
    data: LanguageRequestDto
  ): Promise<OrganizationInterfaces.ResponseWithoutPagination> {
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
  ): Promise<OrganizationInterfaces.ResponseWithPagination> {
    const where: any = {
      ...(data.status == 2
        ? {}
        : {
            status: data.status,
          }),
    };
    console.log(where);

    if (data.search) {
      where.StreetTranslations = {
        some: {
          languageCode: data.langCode,
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
          where: data.allLang
            ? {}
            : {
                languageCode: data.langCode,
              },
          select: {
            name: true,
            languageCode: true,
          },
        },
        StreetNewNameTranslations: {
          where: data.allLang
            ? {}
            : {
                languageCode: data.langCode,
              },
          select: {
            name: true,
            languageCode: true,
          },
        },
        StreetOldNameTranslations: {
          where: data.allLang
            ? {}
            : {
                languageCode: data.langCode,
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
        newName: nameNew,
        oldName: nameOld,
      });
    }

    return {
      data: formattedStreet,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<OrganizationInterfaces.Response> {
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
