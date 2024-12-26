import { Nearbees } from './../../../node_modules/.prisma/client/index.d';
import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatedByEnum,
  DeleteDto,
  GetOneDto,
  ListQueryDto,
  OrganizationMethodEnum,
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
import { OrganizationVersionService } from '../organization-version/organization-version.service';
import { PhoneTypeService } from '../phone-type/phone-type.service';
import formatOrganizationResponse, {
  modulesConfig,
} from '@/common/helper/for-Org/format-module-for-org';
import buildInclude, {
  includeConfig,
} from '@/common/helper/for-Org/build-include-for-org';
import { OrganizationFilterDto } from 'types/organization/organization/dto/filter-organization.dto';
import { ConfirmDto } from 'types/organization/organization/dto/confirm-organization.dto';
import { MyOrganizationFilterDto } from 'types/organization/organization/dto/filter-my-organization.dto';
import { OrganizationDeleteDto } from 'types/organization/organization/dto/delete-organization.dto';
import { OrganizationRestoreDto } from 'types/organization/organization/dto/get-restore-organization.dto';
import { OrganizationVersionInterfaces } from 'types/organization/organization-version';
import buildIncludeVersion, {
  includeConfigVersion,
} from '@/common/helper/for-Org-version/build-include-for-org';
import formatOrganizationResponseVersion, {
  modulesConfigVersion,
} from '@/common/helper/for-Org-version/format-module-for-org';
import { UnconfirmOrganizationFilterDto } from 'types/organization/organization/dto/filter-unconfirm-organization.dto';
import { PassageService } from '../passage/passage.service';

@Injectable()
export class OrganizationService {
  constructor(
    @Inject(forwardRef(() => OrganizationVersionService))
    private readonly organizationVersionService: OrganizationVersionService,
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
    private readonly PhoneTypeService: PhoneTypeService,
    private readonly PassageService: PassageService
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

    let district;
    if (data.districtId) {
      district = await this.districtService.findOne({
        id: data.districtId,
      });
    }

    let village;
    if (data.villageId) {
      village = await this.VillageService.findOne({
        id: data.villageId,
      });
    }

    let avenue;
    if (data.avenueId) {
      avenue = await this.AvenueService.findOne({
        id: data.avenueId,
      });
    }

    let residential;
    if (data.residentialId) {
      residential = await this.ResidentialAreaService.findOne({
        id: data.residentialId,
      });
    }

    let area;
    if (data.areaId) {
      area = await this.AreaService.findOne({
        id: data.areaId,
      });
    }

    let street;
    if (data.streetId) {
      street = await this.StreetService.findOne({
        id: data.streetId,
      });
    }

    let lane;
    if (data.laneId) {
      lane = await this.LaneService.findOne({
        id: data.laneId,
      });
    }

    let impasse;
    if (data.impasseId) {
      impasse = await this.ImpasseService.findOne({
        id: data.impasseId,
      });
    }

    let passage;
    if (data.passageId) {
      passage = await this.PassageService.findOne({
        id: data.impasseId,
      });
    }

    const segment = await this.SegmentService.findOne({
      id: data.segmentId,
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
        description: nearbees[i]?.description,
        NearbyId: nearby.id,
      });
    }

    let productServiceCreateArray = [];
    let productServices = data?.productService['productServices'];
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

    const organization = await this.prisma.organization.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        districtId: district?.id,
        villageId: village?.id,
        avenueId: avenue?.id,
        residentialId: residential?.id,
        areaId: area?.id,
        streetId: street?.id,
        laneId: lane?.id,
        impasseId: impasse?.id,
        segmentId: segment.id,
        mainOrganizationId: mainOrganization.id,
        subCategoryId: subCategory.id,
        description: data.description,
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
        passageId: data?.passageId,
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

    if (data.apartment) {
      where.apartment = { contains: data.apartment, mode: 'insensitive' };
    }

    if (data.categoryId) {
      where.subCategoryId = data.categoryId;
    }

    if (data.cityId) {
      where.cityId = data.cityId;
    }

    if (data.districtId) {
      where.districtId = data.districtId;
    }

    if (data.home) {
      where.home = { contains: data.home, mode: 'insensitive' };
    }

    if (data.kvartal) {
      where.kvartal = { contains: data.kvartal, mode: 'insensitive' };
    }

    if (data.mainOrg) {
      where.mainOrganizationId = data.mainOrg;
    }

    if (data.name) {
      where.name = { contains: data.name, mode: 'insensitive' };
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

    if (data.villageId) {
      where.villageId = data.villageId;
    }

    if (data.belongAbonent === true) {
      where.createdBy = CreatedByEnum.Client;
    }

    if (data.bounded === true) {
      where.createdBy = CreatedByEnum.Billing;
    }

    if (data.mine === true) {
      where.staffNumber = data.staffNumber;
    }

    if (data.nearbyId) {
      where.Nearbees = {
        some: {
          NearbyId: data.nearbyId,
        },
      };
    }

    if (data.categoryTuId) {
      where.ProductServices = {
        some: {
          ProductServiceCategoryId: data.categoryTuId,
        },
      };
    }

    if (data.subCategoryTuId) {
      where.ProductServices = {
        some: {
          ProductServiceSubCategoryId: data.subCategoryTuId,
        },
      };
    }

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
      ...{
        status: data.status,
      },
      ...where,
    };

    if (data.search) {
      whereWithLang.StreetTranslations = {
        some: {
          languageCode: data.langCode,
          name: {
            contains: data.search,
            mode: 'insensitive',
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

  async findMy(
    data: MyOrganizationFilterDto
  ): Promise<OrganizationVersionInterfaces.ResponseWithPagination> {
    const include = buildIncludeVersion(includeConfigVersion, data);
    const where = {
      staffNumber: data.staffNumber,
    };
    if (data.all) {
      const organizations = await this.prisma.organizationVersion.findMany({
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
        const formattedOrganization = formatOrganizationResponseVersion(
          org,
          modulesConfigVersion
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
      ...{
        status: data.status,
      },
      ...where,
    };

    const count = await this.prisma.organizationVersion.count({
      where: whereWithLang,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const organization = await this.prisma.organizationVersion.findMany({
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

      const formattedOrganization = formatOrganizationResponseVersion(
        org,
        modulesConfigVersion
      );

      result.push(formattedOrganization);
    }

    return {
      data: result,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findUnconfirm(
    data: UnconfirmOrganizationFilterDto
  ): Promise<OrganizationVersionInterfaces.ResponseWithPagination> {
    const include = buildIncludeVersion(includeConfigVersion, data);
    const where = {
      status: 0,
      createdBy: data.createdBy,
    };
    if (data.all) {
      const organizations = await this.prisma.organizationVersion.findMany({
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
        const formattedOrganization = formatOrganizationResponseVersion(
          org,
          modulesConfigVersion
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
      ...where,
    };

    const count = await this.prisma.organizationVersion.count({
      where: whereWithLang,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const organization = await this.prisma.organizationVersion.findMany({
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

      const formattedOrganization = formatOrganizationResponseVersion(
        org,
        modulesConfigVersion
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
      throw new NotFoundException('Organization is not found');
    }

    let formattedOrganization = formatOrganizationResponse(
      organization,
      modulesConfig
    );

    return formattedOrganization;
  }

  async update(id: number): Promise<OrganizationInterfaces.Response> {
    const organizationVersion = await this.prisma.organizationVersion.findFirst(
      {
        where: {
          organizationId: id,
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

    let PhoneCreateArray = [];
    let phones = organizationVersion.PhoneVersion;

    await this.prisma.phone.deleteMany({
      where: {
        OrganizationId: organizationVersion.organizationId,
      },
    });
    for (let i = 0; i < phones?.length; i++) {
      PhoneCreateArray.push({
        phone: phones[i].phone,
        PhoneTypeId: phones[i].PhoneTypeId,
        isSecret: phones[i].isSecret,
      });
    }
    let nearbeesCreateArray = [];
    let nearbees = organizationVersion.NearbeesVersion;

    await this.prisma.nearbees.deleteMany({
      where: {
        OrganizationId: organizationVersion.organizationId,
      },
    });
    for (let i = 0; i < nearbees?.length; i++) {
      nearbeesCreateArray.push({
        description: nearbees[i].description,
        NearbyId: nearbees[i].NearbyId,
      });
    }

    let productServiceCreateArray = [];
    let productServices = organizationVersion?.ProductServicesVersion;
    await this.prisma.productServices.deleteMany({
      where: {
        OrganizationId: organizationVersion.organizationId,
      },
    });
    for (let i = 0; i < productServices?.length; i++) {
      productServiceCreateArray.push({
        ProductServiceCategoryId: productServices[i].ProductServiceCategoryId,
        ProductServiceSubCategoryId:
          productServices[i].ProductServiceSubCategoryId,
      });
    }

    let PaymentTypesCreateArray = [];

    await this.prisma.paymentTypes.deleteMany({
      where: {
        OrganizationId: organizationVersion.organizationId,
      },
    });
    PaymentTypesCreateArray.push({
      Cash: organizationVersion.PaymentTypesVersion[0].Cash,
      Terminal: organizationVersion.PaymentTypesVersion[0].Terminal,
      Transfer: organizationVersion.PaymentTypesVersion[0].Transfer,
    });

    let PhotoLinkCreateArray = [];

    let PhotoLinks = organizationVersion?.PictureVersion;

    await this.prisma.picture.deleteMany({
      where: {
        OrganizationId: organizationVersion.organizationId,
      },
    });
    for (let i = 0; i < PhotoLinks?.length; i++) {
      PhotoLinkCreateArray.push({
        link: PhotoLinks[i].link,
      });
    }

    const UpdateOrganization = await this.prisma.organization.update({
      where: {
        id: id,
      },
      data: {
        regionId: organizationVersion.regionId,
        cityId: organizationVersion.cityId,
        districtId: organizationVersion.districtId,
        villageId: organizationVersion.villageId,
        avenueId: organizationVersion.avenueId,
        residentialId: organizationVersion.residentialId,
        areaId: organizationVersion.areaId,
        streetId: organizationVersion.streetId,
        laneId: organizationVersion.laneId,
        impasseId: organizationVersion.impasseId,
        segmentId: organizationVersion.segmentId,
        mainOrganizationId: organizationVersion.mainOrganizationId,
        subCategoryId: organizationVersion.subCategoryId,
        account: organizationVersion.account,
        bankNumber: organizationVersion.bankNumber,
        address: organizationVersion.address,
        apartment: organizationVersion.apartment,
        home: organizationVersion.home,
        inn: organizationVersion.inn,
        kvartal: organizationVersion.kvartal,
        legalName: organizationVersion.legalName,
        mail: organizationVersion.mail,
        name: organizationVersion.name,
        secret: organizationVersion.secret,
        manager: organizationVersion.manager,
        index: organizationVersion.index,
        transport: organizationVersion.transport,
        workTime: organizationVersion.workTime,
        staffNumber: organizationVersion.staffNumber,
        description: organizationVersion.description,
        passageId: organizationVersion.passageId,
        status: OrganizationStatusEnum.Accepted,
        PaymentTypes: {
          create: PaymentTypesCreateArray,
        },
        Phone: {
          create: PhoneCreateArray,
        },
        Picture: {
          create: PhotoLinkCreateArray,
        },
        ProductServices: {
          create: productServiceCreateArray,
        },
        Nearbees: {
          create: nearbeesCreateArray,
        },
      },
      include: {
        PaymentTypes: true,
        Phone: true,
        Picture: true,
        ProductServices: true,
        Nearbees: true,
      },
    });

    return UpdateOrganization;
  }

  async confirmOrg(data: ConfirmDto): Promise<any> {
    if (data.role == CreatedByEnum.Moderator) {
      if (data.status == OrganizationStatusEnum.Accepted) {
        const organizationVersion =
          await this.prisma.organizationVersion.findFirst({
            where: {
              organizationId: data.id,
            },
          });
        if (!organizationVersion) {
          throw new NotFoundException('Orgnization  is not found');
        }
        if (organizationVersion.method == OrganizationMethodEnum.Update) {
          await this.prisma.organizationVersion.update({
            where: {
              id: organizationVersion.id,
            },
            data: {
              status: OrganizationStatusEnum.Accepted,
            },
          });

          return await this.update(data.id);
        } else if (
          organizationVersion.method == OrganizationMethodEnum.Create
        ) {
          await this.prisma.organizationVersion.update({
            where: {
              id: organizationVersion.id,
            },
            data: {
              status: OrganizationStatusEnum.Accepted,
            },
          });
          return await this.prisma.organization.update({
            where: {
              id: organizationVersion.organizationId,
            },
            data: {
              status: OrganizationStatusEnum.Accepted,
            },
          });
        } else if (
          organizationVersion.method == OrganizationMethodEnum.Delete
        ) {
          await this.prisma.organizationVersion.update({
            where: {
              id: organizationVersion.id,
            },
            data: {
              status: OrganizationStatusEnum.Deleted,
            },
          });
          return await this.prisma.organization.update({
            where: {
              id: organizationVersion.organizationId,
            },
            data: {
              status: OrganizationStatusEnum.Deleted,
            },
          });
        } else if (
          organizationVersion.method == OrganizationMethodEnum.Restore
        ) {
          await this.prisma.organizationVersion.update({
            where: {
              id: organizationVersion.id,
            },
            data: {
              status: OrganizationStatusEnum.Accepted,
            },
          });
          return await this.prisma.organization.update({
            where: {
              id: organizationVersion.organizationId,
            },
            data: {
              status: OrganizationStatusEnum.Accepted,
            },
          });
        }
      } else if (data.status == OrganizationStatusEnum.Rejected) {
        const organizationVersion =
          await this.prisma.organizationVersion.findFirst({
            where: {
              organizationId: data.id,
            },
          });
        if (!organizationVersion) {
          throw new NotFoundException('Orgnization  is not found');
        }

        return await this.prisma.organizationVersion.update({
          where: {
            id: organizationVersion.id,
          },
          data: {
            status: OrganizationStatusEnum.Rejected,
          },
        });
      }
    }
  }

  async remove(
    data: OrganizationDeleteDto
  ): Promise<OrganizationInterfaces.Response> {
    if (data.delete) {
      const organizationVersion =
        await this.prisma.organizationVersion.findFirst({
          where: {
            organizationId: data.id,
          },
        });
      if (!organizationVersion) {
        throw new NotFoundException('Orgnization  is not found');
      }
      if (data.role == CreatedByEnum.Moderator) {
        await this.prisma.organizationVersion.update({
          where: {
            id: organizationVersion.id,
          },
          data: {
            status: OrganizationStatusEnum.Deleted,
            method: OrganizationMethodEnum.Delete,
          },
          include: {
            PaymentTypesVersion: true,
            PhoneVersion: true,
            PictureVersion: true,
            ProductServicesVersion: true,
            NearbeesVersion: true,
          },
        });
        return await this.prisma.organization.update({
          where: {
            id: organizationVersion.id,
          },
          data: {
            status: OrganizationStatusEnum.Deleted,
          },
          include: {
            PaymentTypes: true,
            Phone: true,
            Picture: true,
            ProductServices: true,
            Nearbees: true,
          },
        });
      } else {
        return await this.prisma.organizationVersion.update({
          where: {
            id: organizationVersion.id,
          },
          data: {
            status: OrganizationStatusEnum.Check,
            method: OrganizationMethodEnum.Delete,
          },
          include: {
            PaymentTypesVersion: true,
            PhoneVersion: true,
            PictureVersion: true,
            ProductServicesVersion: true,
            NearbeesVersion: true,
          },
        });
      }
    }
  }

  async restore(
    data: OrganizationRestoreDto
  ): Promise<OrganizationInterfaces.Response> {
    const organizationVersion = await this.prisma.organizationVersion.findFirst(
      {
        where: {
          organizationId: data.id,
        },
      }
    );
    if (!organizationVersion) {
      throw new NotFoundException('Orgnization  is not found');
    }
    if (data.role == CreatedByEnum.Moderator) {
      await this.prisma.organizationVersion.update({
        where: {
          id: organizationVersion.id,
        },
        data: {
          status: OrganizationStatusEnum.Accepted,
          method: OrganizationMethodEnum.Restore,
        },
        include: {
          PaymentTypesVersion: true,
          PhoneVersion: true,
          PictureVersion: true,
          ProductServicesVersion: true,
          NearbeesVersion: true,
        },
      });
      return await this.prisma.organization.update({
        where: {
          id: organizationVersion.id,
        },
        data: {
          status: OrganizationStatusEnum.Accepted,
        },
        include: {
          PaymentTypes: true,
          Phone: true,
          Picture: true,
          ProductServices: true,
          Nearbees: true,
        },
      });
    } else {
      return await this.prisma.organizationVersion.update({
        where: {
          id: organizationVersion.id,
        },
        data: {
          status: OrganizationStatusEnum.Check,
          method: OrganizationMethodEnum.Restore,
        },
        include: {
          PaymentTypesVersion: true,
          PhoneVersion: true,
          PictureVersion: true,
          ProductServicesVersion: true,
          NearbeesVersion: true,
        },
      });
    }
  }
}
