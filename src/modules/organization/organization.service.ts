import {
  PhoneTypes,
  PhoneTypesTranslations,
} from './../../../node_modules/.prisma/client/index.d';
import { Phone } from './../../../types/organization/organization/types/index';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatedByEnum,
  GetOneDto,
  ListQueryDto,
  OrganizationStatusEnum,
} from 'types/global';
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
import { PhoneTypeService } from '../phone-type/phone-type.service';
import formatOrganizationResponse, {
  modulesConfig,
} from '@/common/helper/for-Org/format-module-for-org';
import buildInclude, {
  includeConfig,
} from '@/common/helper/for-Org/build-include-for-org';
import { OrganizationFilterDto } from 'types/organization/organization/dto/filter-organization.dto';

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
    private readonly PhoneTypeService: PhoneTypeService,
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

    const segment = await this.SegmentService.findOne({
      id: data.segmentId,
    });

    const section = await this.SectionService.findOne({
      id: data.sectionId,
    });

    let phoneCreateArray = [];
    let phones = data.phone['phones'];
    for (let i = 0; i < phones?.length; i++) {
      const phoneType = await this.PhoneTypeService.findOne({
        id: phones[i].phoneTypeId,
      });
      phoneCreateArray.push({
        phone: phones[i].phone,
        PhoneTypeId: phoneType.id,
        isSecret: phones[i].isSecret,
      });
    }

    let nearbeesCreateArray = [];
    let nearbees = data?.nearby['nearbees'];
    for (let i = 0; i < nearbees?.length; i++) {
      const nearby = await this.NearbyService.findOne({
        id: nearbees[i].nearbyId,
      });
      nearbeesCreateArray.push({
        description: nearbees[i].description,
        NearbyId: nearby.id,
      });
    }

    let productServiceCreateArray = [];
    let productServices = data?.productService['productServices'];
    for (let i = 0; i < productServices?.length; i++) {
      // const productServiceCategory =
      //   await this.productServiceCategoryService.findOne({
      //     id: data.productServiceCategoryId,
      //   });
      // const productServiceSubCategory =
      //   await this.productServiceSubCategoryService.findOne({
      //     id: data.productServiceSubCategoryId,
      //   });
      productServiceCreateArray.push({
        ProductServiceCategoryId: productServices[i].productServiceCategoryId,
        ProductServiceSubCategoryId:
          productServices[i].productServiceSubCategoryId,
      });
    }

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
        segmentId: segment.id,
        sectionId: section.id,
        mainOrganizationId: mainOrganization.id,
        subCategoryId: subCategory.id,
        description: data.description,
        account: data.account,
        bankNumber: data.bankNumber,
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
        manager: data.manager,
        index: data.index,
        transport: data.transport,
        workTime: data.workTime,
        staffNumber: data.staffNumber,
        passageId: data.passageId,
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
          create: phoneCreateArray,
        },
        Picture: {
          create: data.PhotoLink,
        },
        Nearbees: {
          create: nearbeesCreateArray,
        },
        ProductServices: {
          create: productServiceCreateArray,
        },
      },
      include: {
        PaymentTypes: true,
        Phone: true,
        Picture: true,
        Nearbees: true,
        ProductServices: true,
      },
    });

    await this.organizationVersionService.create(organization);

    return organization;
  }

  async findAll(
    data: OrganizationFilterDto
  ): Promise<OrganizationInterfaces.ResponseWithPagination> {
    const include = buildInclude(includeConfig, data);
    const where: any = {};

    if (data.address) {
      where.address = { contains: data.address, mode: 'insensitive' }; 
    }

    // if (data.apartment) {
    //   where.apartment = { contains: data.apartment, mode: 'insensitive' }; 
    // }

    if (data.categoryId) {
      where.subCategoryId = data.categoryId; 
    }

    if (data.categoryTuId) {
      where.productServiceCategoryId = data.categoryTuId; 
    }

    if (data.cityId) {
      where.cityId = data.cityId;
    }

    if (data.districtId) {
      where.districtId = data.districtId; 
    }

    // if (data.home) {
    //   where.home = { contains: data.home, mode: 'insensitive' }; 
    // }

    if (data.kvartal) {
      where.kvartal = { contains: data.kvartal, mode: 'insensitive' }; 
    }

    if (data.mainOrg) {
      where.mainOrganizationId = data.mainOrg; 
    }

    if (data.name) {
      where.name = { contains: data.name, mode: 'insensitive' }; 
    }

    
    if (data.nearbyId) {
      where.nearbyId = data.nearbyId; 
    }

    if (data.phone) {
      where.Phone = {
        some: { phone: { contains: data.phone, mode: 'insensitive' } },
      }; 
    }

    if (data.phoneType) {
      where.Phone = { some: { PhoneTypes: { id: data.phoneType } } }; 
    }

    if (data.regionId) {
      where.regionId = data.regionId;
    }

    if (data.subCategoryId) {
      where.subCategoryId = data.subCategoryId; 
    }

    if (data.subCategoryTuId) {
      where.productServiceSubCategoryId = data.subCategoryTuId; 
    }

    if (data.villageId) {
      where.villageId = data.villageId; 
    }

    // if (data.belongAbonent === true) {
    //   where.segmentId = data.belongAbonent; 
    // }

    if (data.bounded === true) {
      where.createdBy = 'billing'; 
    }

    if (data.mine === true) {
      where.staffNumber = data.staffNumber; 
    }

    // Дополнительно проверяем на пустоту объекта перед запросом
    // if (Object.keys(where).length === 0) {
    //   throw new Error(
    //     'Необходимо указать хотя бы одно условие для фильтрации.'
    //   );
    // }

    if (data.all) {
      const organizations = await this.prisma.organization.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include,
      });
      const result = [];
      for (let [index, org] of Object.entries(organizations)) {
        for (let [key, prop] of Object.entries(includeConfig)) {
          let idNameOfModules = key.toLocaleLowerCase() + 'Id';
          delete org?.[idNameOfModules];
        }
        const formattedOrganization = formatOrganizationResponse(
          org,
          modulesConfig
        );
        result.push(formattedOrganization);
      }

      return {
        data: result,
        totalPage: 1,
        totalDocs: organizations.length,
      };
    }

    const whereWithLang: any = {
      ...(data.status == 2
        ? {}
        : {
            status: data.status,
          }),
      ...where,
    };

    if (data.search) {
      whereWithLang.StreetTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
          },
        },
      };
    }
    const count = await this.prisma.organization.count({
      where: whereWithLang,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const organization = await this.prisma.organization.findMany({
      where: whereWithLang,
      orderBy: { createdAt: 'desc' },
      include,
      take: pagination.take,
      skip: pagination.skip,
    });
    const result = [];
    for (let [index, org] of Object.entries(organization)) {
      for (let [key, prop] of Object.entries(includeConfig)) {
        let idNameOfModules = key.toLocaleLowerCase() + 'Id';
        delete org?.[idNameOfModules];
      }
      const formattedOrganization = formatOrganizationResponse(
        org,
        modulesConfig
      );
      result.push(formattedOrganization);
    }
    return {
      data: result,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<OrganizationInterfaces.Response> {
    const include = buildInclude(includeConfig, data);

    const organization = await this.prisma.organization.findFirst({
      where: {
        id: data.id,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        ...include,
      },
    });
    for (let [key, prop] of Object.entries(includeConfig)) {
      let idNameOfModules = key.toLocaleLowerCase() + 'Id';
      delete organization?.[idNameOfModules];
    }
    if (!organization) {
      throw new NotFoundException('Street is not found');
    }

    let formattedOrganization = formatOrganizationResponse(
      organization,
      modulesConfig
    );

    return formattedOrganization;
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
