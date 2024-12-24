import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatedByEnum,
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  LanguageRequestEnum,
  ListQueryDto,
  OrganizationMethodEnum,
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
import {
  OrganizationVersionInterfaces,
  OrganizationVersionUpdateDto,
} from 'types/organization/organization-version';
import { OrganizationService } from '../organization/organization.service';
import { PhoneTypeService } from '../phone-type/phone-type.service';

@Injectable()
export class OrganizationVersionService {
  constructor(
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    private readonly prisma: PrismaService,
    private readonly mainOrganizationService: MainOrganizationService,
    private readonly subCategoryService: SubCategoryService,
    private readonly productServiceCategoryService: ProductServiceCategoryService,
    private readonly productServiceSubCategoryService: ProductServiceSubCategoryService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
    private readonly districtService: DistrictService,
    private readonly villageService: VillageService,
    private readonly avenueService: AvenueService,
    private readonly residentialAreaService: ResidentialAreaService,
    private readonly areaService: AreaService,
    private readonly streetService: StreetService,
    private readonly laneService: LaneService,
    private readonly impasseService: ImpasseService,
    private readonly nearbyService: NearbyService,
    private readonly segmentService: SegmentService,
    private readonly phoneTypeService: PhoneTypeService
  ) {}

  async create(
    data: OrganizationVersionInterfaces.Request
  ): Promise<OrganizationVersionInterfaces.Response> {
    let phones = data['Phone'] || [];
    const createdPhonesVersion = [];

    for (let i = 0; i < phones?.length; i++) {
      createdPhonesVersion.push({
        phone: phones[i].phone,
        PhoneTypeId: phones[i].PhoneTypeId,
        isSecret: phones[i].isSecret,
        // phoneAction: OrganizationVersionActionsEnum.GET,
      });
    }
    const createdPicturesVersion = [];
    let pictures = data.Picture;

    for (let i = 0; i < pictures?.length; i++) {
      createdPicturesVersion.push({
        link: pictures[i].link,
        //  pictureAction: OrganizationVersionActionsEnum.GET,
      });
    }

    let nearbeesCreateVersionArray = [];
    let nearbees = data['Nearbees'];
    for (let i = 0; i < nearbees?.length; i++) {
      //  const nearby = await this.NearbyService.findOne({
      //    id: nearbees[i].nearbyId,
      //  });
      nearbeesCreateVersionArray.push({
        description: nearbees[i].description,
        NearbyId: nearbees[i].NearbyId,
      });
    }

    let productServiceCreateVersionArray = [];
    let productServices = data['ProductServices'];
    for (let i = 0; i < productServices?.length; i++) {
      productServiceCreateVersionArray.push({
        ProductServiceCategoryId: productServices[i].ProductServiceCategoryId,
        ProductServiceSubCategoryId:
          productServices[i].ProductServiceSubCategoryId,
      });
    }
    let PymentTypesVersion = [
      {
        Cash: data['PaymentTypes'][0].Cash,
        Terminal: data['PaymentTypes'][0].Terminal,
        Transfer: data['PaymentTypes'][0].Transfer,
      },
    ];

    const organizationVersion = await this.prisma.organizationVersion.create({
      data: {
        organizationId: data.id,
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
        segmentId: data.segmentId,
        mainOrganizationId: data.mainOrganizationId,
        subCategoryId: data.subCategoryId,
        account: data.account,
        bankNumber: data.bankNumber,
        address: data.address,
        apartment: data.apartment,
        home: data.home,
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
        description: data.description,
        passageId: data.passageId,
        status: data.status,
        createdBy: data.createdBy,
        method: OrganizationMethodEnum.Create,
        PaymentTypesVersion: {
          create: PymentTypesVersion,
        },
        PhoneVersion: {
          create: createdPhonesVersion,
        },
        PictureVersion: {
          create: createdPicturesVersion,
        },
        ProductServicesVersion: {
          create: productServiceCreateVersionArray,
        },
        NearbeesVersion: {
          create: nearbeesCreateVersionArray,
        },
      },
      include: {
        PaymentTypesVersion: true,
        PhoneVersion: true,
        PictureVersion: true,
        ProductServicesVersion: true,
        NearbeesVersion: true,
      },
    });

    return organizationVersion;
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
                PhoneTypesTranslations: {
                  select: {
                    languageCode: true,
                    name: true,
                  },
                },
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
                PhoneTypesTranslations: {
                  select: {
                    languageCode: true,
                    name: true,
                  },
                },
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

  async update(
    data: OrganizationVersionUpdateDto
  ): Promise<OrganizationVersionInterfaces.Response> {
    const organizationVersion = await this.prisma.organizationVersion.findFirst(
      {
        where: {
          organizationId: data.id,
        },
        include: {
          PaymentTypesVersion: true,
          PhoneVersion: true,
          PictureVersion: true,
          ProductServicesVersion: true,
          NearbeesVersion: true,
        },
      }
    );

    if (!organizationVersion) {
      throw new NotFoundException('Orgnization version is not found');
    }

    if (data.mainOrganizationId) {
      await this.mainOrganizationService.findOne({
        id: data.mainOrganizationId,
      });
    }

    if (data.subCategoryId) {
      await this.subCategoryService.findOne({
        id: data.subCategoryId,
      });
    }
    if (data.regionId) {
      await this.regionService.findOne({
        id: data.regionId,
      });
    }
    if (data.cityId) {
      await this.cityService.findOne({
        id: data.cityId,
      });
    }
    if (data.districtId) {
      await this.districtService.findOne({
        id: data.districtId,
      });
    }
    if (data.villageId) {
      await this.villageService.findOne({
        id: data.villageId,
      });
    }
    if (data.avenueId) {
      await this.avenueService.findOne({
        id: data.avenueId,
      });
    }
    if (data.residentialId) {
      await this.residentialAreaService.findOne({
        id: data.residentialId,
      });
    }
    if (data.areaId) {
      await this.areaService.findOne({
        id: data.areaId,
      });
    }
    if (data.streetId) {
      await this.streetService.findOne({
        id: data.streetId,
      });
    }

    if (data.laneId) {
      await this.laneService.findOne({ id: data.laneId });
    }

    if (data.impasseId) {
      await this.impasseService.findOne({ id: data.impasseId });
    }

    if (data.segmentId) {
      await this.segmentService.findOne({ id: data.segmentId });
    }

    let PhoneCreateVersionArray = [];
    let phones = data.phone['phones'];
    if (phones.length > 0) {
      await this.prisma.phoneVersion.deleteMany({
        where: {
          OrganizationVersionId: organizationVersion.id,
        },
      });
      for (let i = 0; i < phones?.length; i++) {
        const phoneType = await this.phoneTypeService.findOne({
          id: phones[i].phoneTypeId,
        });
        PhoneCreateVersionArray.push({
          phone: phones[i].phone,
          PhoneTypeId: phoneType.id,
          isSecret: phones[i].isSecret,
        });
      }
    }

    let nearbeesCreateVersionArray = [];
    let nearbees = data?.nearby['nearbees'];
    if (nearbees.length > 0) {
      await this.prisma.nearbeesVersion.deleteMany({
        where: {
          OrganizationVersionId: organizationVersion.id,
        },
      });
      for (let i = 0; i < nearbees?.length; i++) {
        const nearby = await this.nearbyService.findOne({
          id: nearbees[i].nearbyId,
        });
        nearbeesCreateVersionArray.push({
          description: nearbees[i].description,
          NearbyId: nearby.id,
        });
      }
    }

    let productServiceCreateArray = [];
    let productServices = data?.productService['productServices'];
    if (productServices.length > 0) {
      await this.prisma.productServicesVersion.deleteMany({
        where: {
          OrganizationVersionId: organizationVersion.id,
        },
      });
      for (let i = 0; i < productServices?.length; i++) {
        if (productServices[i].productServiceCategoryId) {
          await this.productServiceCategoryService.findOne({
            id: productServices[i].productServiceCategoryId,
          });
        }
        if (productServices[i].productServiceSubCategoryId) {
          await this.productServiceSubCategoryService.findOne({
            id: productServices[i].productServiceSubCategoryId,
          });
        }

        productServiceCreateArray.push({
          ProductServiceCategoryId: productServices[i].productServiceCategoryId,
          ProductServiceSubCategoryId:
            productServices[i].productServiceSubCategoryId,
        });
      }
    }

    let PaymentTypesVersionCreateArray = [];
    if (data.paymentTypes) {
      await this.prisma.paymentTypesVersion.deleteMany({
        where: {
          OrganizationVersionId: organizationVersion.id,
        },
      });
      PaymentTypesVersionCreateArray.push({
        Cash: data.paymentTypes.cash,
        Terminal: data.paymentTypes.terminal,
        Transfer: data.paymentTypes.transfer,
      });
    }

    let PhotoLinkCreateVersionArray = [...data.PhotoLink];

    let PhotoLinks = data?.picture['pictures'];
    if (PhotoLinks.length > 0) {
      await this.prisma.pictureVersion.deleteMany({
        where: {
          OrganizationVersionId: organizationVersion.id,
        },
      });
      PhotoLinkCreateVersionArray.push(...PhotoLinks);
    }
    let status =
      data.role == CreatedByEnum.Moderator &&
      organizationVersion.staffNumber == data.staffNumber
        ? OrganizationStatusEnum.Accepted
        : OrganizationStatusEnum.Check;

    const UpdateOrganizationVersion =
      await this.prisma.organizationVersion.update({
        where: {
          id: organizationVersion.id,
        },
        data: {
          regionId: data.regionId || organizationVersion.regionId,
          cityId: data.cityId || organizationVersion.cityId,
          districtId: data.districtId || organizationVersion.districtId,
          villageId: data.villageId || organizationVersion.villageId,
          avenueId: data.avenueId || organizationVersion.avenueId,
          residentialId:
            data.residentialId || organizationVersion.residentialId,
          areaId: data.areaId || organizationVersion.areaId,
          streetId: data.streetId || organizationVersion.streetId,
          laneId: data.laneId || organizationVersion.laneId,
          impasseId: data.impasseId || organizationVersion.impasseId,
          segmentId: data.segmentId || organizationVersion.segmentId,
          mainOrganizationId:
            data.mainOrganizationId || organizationVersion.mainOrganizationId,
          subCategoryId:
            data.subCategoryId || organizationVersion.subCategoryId,
          account: data.account || organizationVersion.account,
          bankNumber: data.bankNumber || organizationVersion.bankNumber,
          address: data.address || organizationVersion.address,
          apartment: data.apartment || organizationVersion.apartment,
          home: data.home || organizationVersion.home,
          inn: data.inn || organizationVersion.inn,
          kvartal: data.kvartal || organizationVersion.kvartal,
          legalName: data.legalName || organizationVersion.legalName,
          mail: data.mail || organizationVersion.mail,
          name: data.name || organizationVersion.name,
          secret: data.secret || organizationVersion.secret,
          manager: data.manager || organizationVersion.manager,
          index: data.index || organizationVersion.index,
          transport: data.transport || organizationVersion.transport,
          workTime: data.workTime || organizationVersion.workTime,
          staffNumber: data.staffNumber || organizationVersion.staffNumber,
          description: data.description || organizationVersion.description,
          passageId: data.passageId || organizationVersion.passageId,
          status: status,
          method: OrganizationMethodEnum.Update,
          createdBy: organizationVersion.createdBy,
          PaymentTypesVersion: {
            create: PaymentTypesVersionCreateArray,
          },
          PhoneVersion: {
            create: PhoneCreateVersionArray,
          },
          PictureVersion: {
            create: PhotoLinkCreateVersionArray,
          },
          ProductServicesVersion: {
            create: productServiceCreateArray,
          },
          NearbeesVersion: {
            create: nearbeesCreateVersionArray,
          },
        },
        include: {
          PaymentTypesVersion: true,
          PhoneVersion: true,
          PictureVersion: true,
          ProductServicesVersion: true,
          NearbeesVersion: true,
        },
      });

    if (status == OrganizationStatusEnum.Accepted) {
      await this.organizationService.update(data.id);
    }
    return UpdateOrganizationVersion;
  }

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
