import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatedByEnum,
  DefaultStatus,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
  OrganizationMethodEnum,
  OrganizationStatusEnum,
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
import { NeighborhoodService } from '../neighborhood/neighborhood.service';
import { getOneOrgVersionQuery } from '@/common/helper/for-Org/get-one-org-version';
import { generateCount, generateRate } from '@/common/helper/generate-number';

@Injectable()
export class OrganizationVersionService {
  private logger = new Logger(MainOrganizationService.name);

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
    private readonly NeighborhoodService: NeighborhoodService,
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
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    let phones = data['Phone'] || [];
    const createdPhonesVersion = [];

    for (let i = 0; i < phones?.length; i++) {
      createdPhonesVersion.push({
        phone: phones[i].phone,
        PhoneTypeId: phones[i].PhoneTypeId,
        isSecret: phones[i].isSecret,
      });
    }
    const createdPicturesVersion = [];
    let pictures = data.Picture;
    for (let i = 0; i < pictures?.length; i++) {
      createdPicturesVersion.push({
        link: pictures[i].link,
      });
    }

    let nearbeesCreateVersionArray = [];
    let nearbees = data['Nearbees'];
    for (let i = 0; i < nearbees?.length; i++) {
      nearbeesCreateVersionArray.push({
        description: nearbees[i]?.description,
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
        neighborhoodId: data.neighborhoodId,
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
        socials: data.socials,
        logo: data.logo,
        certificate: data.certificate,
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
        MainOrganization: true,
        PaymentTypesVersion: true,
        PhoneVersion: true,
        PictureVersion: true,
        ProductServicesVersion: true,
        NearbeesVersion: true,
      },
    });
    this.logger.debug(
      `Method: ${methodName} - Response: `,
      organizationVersion
    );

    // if (data.createdBy == CreatedByEnum.Client) {

    //   this.businessService.create({
    //     organizationId: data.id,
    //     certificate: data.certificate,
    //     address: data.address,
    //     social: null,
    //     PhotoLink:null
    //   });
    // }

    return organizationVersion;
  }

  async findAll(
    data: LanguageRequestDto
  ): Promise<OrganizationVersionInterfaces.ResponseWithoutPagination> {
    const methodName: string = this.findAll.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const organizations = await this.prisma.organization.findMany({
      orderBy: { name: 'asc' },
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
    this.logger.debug(`Method: ${methodName} - Response: `, organizations);

    return {
      data: organizations,
      totalDocs: organizations.length,
    };
  }

  async findAllByPagination(
    data: ListQueryDto
  ): Promise<OrganizationVersionInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAllByPagination.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const where: any = { status: DefaultStatus.ACTIVE };
    if (data.search) {
      where.StreetTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
            mode: 'insensitive',
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
    this.logger.debug(`Method: ${methodName} - Response: `, formattedStreet);

    return {
      data: formattedStreet,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(
    data: GetOneDto
  ): Promise<OrganizationVersionInterfaces.Response> {
    const methodName: string = this.findOne.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);

    const organization = await getOneOrgVersionQuery(data.id, this.prisma);

    if (!organization) {
      throw new NotFoundException('Organization is not found');
    }
    this.logger.debug(`Method: ${methodName} - Response: `, organization[0]);

    let formattedOrganization = { ...organization[0] };

    if (data.role == 'moderator' || data.role == 'operator') {
      return formattedOrganization;
    }
    if (data.role !== 'moderator') {
      delete formattedOrganization.secret;
    }

    if (data.role == 'business') {
      if (formattedOrganization?.Phone) {
        const newPhones = [];
        for (let i of formattedOrganization?.Phone) {
          if (!i.isSecret) {
            newPhones.push({
              ...i,
            });
          }
        }
        formattedOrganization.Phone = newPhones;
      }
      return {
        id: formattedOrganization.id,
        name: formattedOrganization.name,
        paymentTypes: formattedOrganization.PaymentTypes,
        phone: formattedOrganization.Phone,
        PictureVersion: formattedOrganization.Pictures,
        site: formattedOrganization.site,
        address: formattedOrganization.address,
        legalName: formattedOrganization.legalName,
        email: formattedOrganization.mail,
        inn: formattedOrganization.inn,
        socials: formattedOrganization.socials,
        transport: formattedOrganization.transport,
        workTime: formattedOrganization.workTime,
        rate: {
          rate: generateRate(),
          count: generateCount(),
        },
        createdAt: formattedOrganization.createdAt,
        updatedAt: formattedOrganization.updatedAt,
        deletedAt: formattedOrganization.deletedAt,
      };
    }

    if (formattedOrganization?.Phone) {
      const newPhones = [];
      for (let i of formattedOrganization?.Phone) {
        if (!i.isSecret) {
          newPhones.push({
            ...i,
            phone: {
              value: i.phone || null,
              requiredPlan: 'standard',
            },
            PhoneTypes: {
              value: i.PhoneTypes || null,
              requiredPlan: 'standard',
            },
          });
        }
      }
      formattedOrganization.Phone = newPhones;
    }

    return formattedOrganization;
    //  }
  }

  async update(
    data: OrganizationVersionUpdateDto
  ): Promise<OrganizationVersionInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
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

    if (data.neighborhoodId) {
      await this.NeighborhoodService.findOne({
        id: data.neighborhoodId,
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
        PhoneCreateVersionArray.push({
          phone: phones[i].phone,
          PhoneTypeId: phones[i].phoneTypeId,
          isSecret: phones[i].isSecret,
        });
      }
    } else if (phones.length == 0) {
      await this.prisma.phoneVersion.deleteMany({
        where: {
          OrganizationVersionId: organizationVersion.id,
        },
      });
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
          description:
            nearbees[i]?.description == 'undefined'
              ? null
              : nearbees[i]?.description,
          NearbyId: nearby.id,
        });
      }
    } else if (nearbees.length == 0) {
      await this.prisma.nearbeesVersion.deleteMany({
        where: {
          OrganizationVersionId: organizationVersion.id,
        },
      });
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
    } else if (productServices.length == 0) {
      await this.prisma.productServicesVersion.deleteMany({
        where: {
          OrganizationVersionId: organizationVersion.id,
        },
      });
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
      for (let e of PhotoLinks) {
        if (e.link) {
          PhotoLinkCreateVersionArray.push({ link: e.link });
        }
      }
    } else if (PhotoLinks.length == 0) {
      await this.prisma.pictureVersion.deleteMany({
        where: {
          OrganizationVersionId: organizationVersion.id,
        },
      });
    }

    let status =
      data.role == CreatedByEnum.Moderator
        ? OrganizationStatusEnum.Accepted
        : OrganizationStatusEnum.Check;
    let method = OrganizationMethodEnum.Update;

    if (
      organizationVersion.method == OrganizationMethodEnum.Create &&
      data.role == CreatedByEnum.Moderator &&
      organizationVersion.status == OrganizationStatusEnum.Check
    ) {
      status = OrganizationStatusEnum.Check;
      method = OrganizationMethodEnum.Create;
    }
    const UpdateOrganizationVersion =
      await this.prisma.organizationVersion.update({
        where: {
          id: organizationVersion.id,
        },
        data: {
          regionId: data.regionId || organizationVersion.regionId,
          cityId: data.cityId || organizationVersion.cityId,
          districtId: data.districtId || null,
          villageId: data.villageId || null,
          avenueId: data.avenueId || null,
          residentialId: data.residentialId || null,
          neighborhoodId: data.neighborhoodId || null,
          areaId: data.areaId || null,
          streetId: data.streetId || null,
          laneId: data.laneId || null,
          impasseId: data.impasseId || null,
          segmentId: data.segmentId || null,
          mainOrganizationId: data.mainOrganizationId || null,
          subCategoryId:
            data.subCategoryId || organizationVersion.subCategoryId,
          account: data.account || null,
          bankNumber: data.bankNumber || organizationVersion.bankNumber,
          address: data.address || organizationVersion.address,
          apartment: data.apartment || organizationVersion.apartment,
          home: data.home || null,
          inn: data.inn || organizationVersion.inn,
          socials: data.social,
          certificate: data.certificate,
          logo:
            data.logoLink == 'null' || data.logoLink == null
              ? null
              : data.logoLink,
          kvartal: data.kvartal || null,
          legalName: data.legalName || organizationVersion.legalName,
          mail: data.mail || organizationVersion.mail,
          name: data.name || organizationVersion.name,
          secret: data.secret || organizationVersion.secret,
          manager: data.manager || organizationVersion.manager,
          index: data.index || organizationVersion.index,
          transport: data.transport || organizationVersion.transport,
          workTime: data.workTime || organizationVersion.workTime,
          editedStaffNumber: data.staffNumber,
          description: data.description || organizationVersion.description,
          passageId: data.passageId || null,
          status: status,
          method: method,
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
    if (data.role == CreatedByEnum.Business && data?.site) {
      const findSite = await this.prisma.site.findFirst({
        where: {
          OrganizationId: data.id,
        },
      });
      if (!findSite) {
        await this.prisma.site.create({
          data: {
            OrganizationId: data.id,
            banner: data.site.banner == 'null' ? null : data.site.banner,
            siteDescription: data.site.site_description,
            map: data.site.map,
          },
        });
      } else {
        await this.prisma.site.update({
          where: {
            id: findSite.id,
          },
          data: {
            banner: data.site.banner == 'null' ? null : data.site.banner,
            siteDescription: data.site?.site_description || null,
            map: data.site.map,
          },
        });
      }
    }

    this.logger.debug(
      `Method: ${methodName} - Response: `,
      UpdateOrganizationVersion
    );
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
