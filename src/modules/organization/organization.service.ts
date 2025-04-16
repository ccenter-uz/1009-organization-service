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
  GetOneDto,
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
import { Prisma } from '@prisma/client';
import { NeighborhoodService } from '../neighborhood/neighborhood.service';
import { CacheService } from '../cache/cache.service';
import { formatCacheKey } from '@/common/helper/format-cache-maneger';
import { getOrg } from '@/common/helper/for-Org/get-org-data.dto';
import { ObjectAdressFilterDto } from 'types/organization/organization/dto/filter-object-adress-organization.dto';
import { formatLanguageResponse } from '@/common/helper/format-language.helper';
import { getOrderedDataWithDistrict } from '@/common/helper/sql-rows-for-select/get-ordered-data-with-district.dto';

@Injectable()
export class OrganizationService {
  private logger = new Logger(OrganizationService.name);

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
    private readonly NeighborhoodService: NeighborhoodService,
    private readonly AreaService: AreaService,
    private readonly StreetService: StreetService,
    private readonly LaneService: LaneService,
    private readonly ImpasseService: ImpasseService,
    private readonly NearbyService: NearbyService,
    private readonly SegmentService: SegmentService,
    private readonly PhoneTypeService: PhoneTypeService,
    private readonly PassageService: PassageService,
    private readonly cacheService: CacheService
  ) {}

  async create(
    data: OrganizationCreateDto
  ): Promise<OrganizationInterfaces.Response> {
    const methodName: string = this.create.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    let mainOrganization;
    if (data.mainOrganizationId) {
      mainOrganization = await this.mainOrganizationService.findOne({
        id: data.mainOrganizationId,
      });
    }

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

    let neighborhood;
    if (data.neighborhoodId) {
      neighborhood = await this.NeighborhoodService.findOne({
        id: data.neighborhoodId,
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

    let segment;
    if (data.segmentId) {
      segment = await this.SegmentService.findOne({
        id: data.segmentId,
      });
    }

    let phoneCreateArray = [];
    let phones = data.phone['phones'];
    for (let i = 0; i < phones?.length; i++) {
      phoneCreateArray.push({
        phone: phones[i].phone,
        PhoneTypeId: phones[i].phoneTypeId,
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
        description:
          nearbees[i]?.description == 'undefined'
            ? null
            : nearbees[i]?.description,
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
    let CreatedByRole = CreatedByEnum.Moderator;

    if (data.role == CreatedByEnum.Client) {
      CreatedByRole = CreatedByEnum.Client;
    }
    if (data.role == CreatedByEnum.Operator) {
      CreatedByRole = CreatedByEnum.Operator;
    }

    const organization = await this.prisma.organization.create({
      data: {
        regionId: region.id,
        cityId: city.id,
        districtId: district?.id,
        villageId: village?.id,
        avenueId: avenue?.id,
        residentialId: residential?.id,
        neighborhoodId: neighborhood?.id,
        areaId: area?.id,
        streetId: street?.id,
        laneId: lane?.id,
        impasseId: impasse?.id,
        segmentId: segment?.id ? segment.id : undefined,
        mainOrganizationId: mainOrganization?.id ? mainOrganization?.id : null,
        subCategoryId: subCategory.id,
        description: data?.description ? data?.description : null,
        account: data?.account ? data?.account : null,
        bankNumber: data?.bankNumber ? data?.bankNumber : null,
        address: data?.address ? data?.address : null,
        apartment: data.apartment ? data.apartment : null,
        home: data.home,
        inn: data?.inn ? data?.inn : null,
        kvartal: data?.kvartal ? data?.kvartal : null,
        legalName: data?.legalName ? data.legalName : undefined,
        mail: data?.mail ? data?.mail : null,
        name: data.name,
        secret: data?.secret ? data?.secret : null,
        manager: data?.manager ? data?.manager : null,
        index: data.index,
        transport: data.transport,
        workTime: data.workTime,
        staffNumber: data.staffNumber,
        passageId: passage?.id,
        status:
          data.role == CreatedByEnum.Moderator
            ? OrganizationStatusEnum.Accepted
            : OrganizationStatusEnum.Check,
        createdBy: CreatedByRole,
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
        MainOrganization: true,
        PaymentTypes: true,
        Phone: true,
        Picture: true,
        Nearbees: true,
        ProductServices: true,
      },
    });

    this.logger.debug(`Method: ${methodName} - Response: `, organization);

    if (data.address) {
      await this.prisma.$executeRawUnsafe(`
        UPDATE organization 
        SET address_search_vector = to_tsvector('simple', address) 
        WHERE id = ${organization.id}
      `);
    }

    await this.prisma.$executeRawUnsafe(`
      UPDATE nearbees 
      SET description_search_vector = to_tsvector('simple', description) 
      WHERE organization_version_id = ${organization.id}
    `);

    this.logger.debug(
      `Method: ${methodName} - Updating translation for tsvector`
    );

    await this.organizationVersionService.create(organization);

    await this.cacheService.invalidateAllCaches('organization');
    return organization;
  }

  async findAll(
    data: OrganizationFilterDto
  ): Promise<OrganizationInterfaces.ResponseWithPagination> {
    const methodName: string = this.findAll.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const include = buildInclude(includeConfig, data);
    console.log(include, 'LOG 1');
    const where: any = {};
    const CacheKey = formatCacheKey(data);
    console.log(CacheKey, 'LOG 2');
    const findOrganization = await this.cacheService.get(
      'organization',
      CacheKey
    );

    if (findOrganization) {
      return findOrganization;
    } else {
      if (data.address) {
        where.OR = [
          { address: { contains: data.address, mode: 'insensitive' } },
          {
            District: {
              DistrictTranslations: {
                some: { name: { contains: data.address, mode: 'insensitive' } },
              },
            },
          },
          {
            Region: {
              RegionTranslations: {
                some: { name: { contains: data.address, mode: 'insensitive' } },
              },
            },
          },
          {
            Passage: {
              PassageTranslations: {
                some: { name: { contains: data.address, mode: 'insensitive' } },
              },
            },
          },
          {
            Street: {
              StreetTranslations: {
                some: { name: { contains: data.address, mode: 'insensitive' } },
              },
            },
          },
          {
            Area: {
              AreaTranslations: {
                some: { name: { contains: data.address, mode: 'insensitive' } },
              },
            },
          },
          {
            Avenue: {
              AvenueTranslations: {
                some: { name: { contains: data.address, mode: 'insensitive' } },
              },
            },
          },
          {
            City: {
              CityTranslations: {
                some: { name: { contains: data.address, mode: 'insensitive' } },
              },
            },
          },
          {
            ResidentialArea: {
              ResidentialAreaTranslations: {
                some: { name: { contains: data.address, mode: 'insensitive' } },
              },
            },
          },
          {
            Neighborhood: {
              NeighborhoodTranslations: {
                some: { name: { contains: data.address, mode: 'insensitive' } },
              },
            },
          },
          {
            Impasse: {
              ImpasseTranslations: {
                some: { name: { contains: data.address, mode: 'insensitive' } },
              },
            },
          },
          {
            Village: {
              VillageTranslations: {
                some: { name: { contains: data.address, mode: 'insensitive' } },
              },
            },
          },
          {
            Lane: {
              LaneTranslations: {
                some: { name: { contains: data.address, mode: 'insensitive' } },
              },
            },
          },
          {
            Nearbees: {
              some: {
                Nearby: {
                  NearbyTranslations: {
                    some: {
                      name: { contains: data.address, mode: 'insensitive' },
                    },
                  },
                },
                description: { contains: data.address, mode: 'insensitive' },
              },
            },
          },
        ];
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

      if (data.streetId) {
        where.streetId = data.streetId;
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
        console.log('Data All', 'LOG 11');
        const organizations = await this.prisma.organization.findMany({
          where,
          orderBy: { name: 'asc' },
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
          if (data.role !== 'moderator') {
            delete formattedOrganization.secret;
          }
          result.push(formattedOrganization);
        }
        this.logger.debug(`Method: ${methodName} - Response: `, result);
        await this.cacheService.setAll('organization', CacheKey, {
          data: result,
          totalDocs: organizations.length,
          totalPage: organizations.length > 0 ? 1 : 0,
        });
        console.log(result, 'Data All', 'LOG 12');

        return {
          data: result,
          totalDocs: organizations.length,
          totalPage: organizations.length > 0 ? 1 : 0,
        };
      }

      const whereWithLang: any = {
        ...(data.status
          ? {
              status: data.status,
            }
          : {}),
        ...where,
      };

      if (data.search) {
        console.log(data.search, 'LOG 14');
        whereWithLang.name = {
          contains: data.search,
          mode: 'insensitive',
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

      const organization: any = await getOrg(data, this.prisma, {
        take: pagination.take,
        skip: pagination.skip,
      });

      this.logger.debug(`Method: ${methodName} - Response: `, organization);
      await this.cacheService.setAll('organization', CacheKey, {
        data: organization,
        totalPage: pagination.totalPage,
        totalDocs: count,
      });
      return {
        data: organization,
        totalPage: pagination.totalPage,
        totalDocs: count,
      };
    }
  }

  async findMy(
    data: MyOrganizationFilterDto
  ): Promise<OrganizationVersionInterfaces.ResponseWithPagination> {
    const methodName: string = this.findMy.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const CacheKey = formatCacheKey(data);
    const findOrganization = await this.cacheService.get(
      'organization',
      CacheKey
    );
    if (findOrganization) {
      return findOrganization;
    } else {
      const include = buildIncludeVersion(includeConfigVersion, data);
      const where = {
        staffNumber: data.staffNumber,
      };
      if (data.all) {
        const organizations = await this.prisma.organizationVersion.findMany({
          where,
          orderBy: { name: 'desc' },
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
          if (data.role !== 'moderator') {
            delete formattedOrganization.secret;
          }
          result.push(formattedOrganization);
        }
        this.logger.debug(`Method: ${methodName} - Response: `, result);
        await this.cacheService.setAll('organization', CacheKey, {
          data: result,
          totalDocs: organizations.length,
          totalPage: organizations.length > 0 ? 1 : 0,
        });
        return {
          data: result,
          totalDocs: organizations.length,
          totalPage: organizations.length > 0 ? 1 : 0,
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
        orderBy: { name: 'desc' },
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
        if (data.role !== 'moderator') {
          delete formattedOrganization.secret;
        }
        result.push(formattedOrganization);
      }
      this.logger.debug(`Method: ${methodName} - Response: `, result);
      await this.cacheService.setAll('organization', CacheKey, {
        data: result,
        totalPage: pagination.totalPage,
        totalDocs: count,
      });
      return {
        data: result,
        totalPage: pagination.totalPage,
        totalDocs: count,
      };
    }
  }

  async findUnconfirm(
    data: UnconfirmOrganizationFilterDto
  ): Promise<OrganizationVersionInterfaces.ResponseWithPagination> {
    const methodName: string = this.findUnconfirm.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const CachKey = formatCacheKey(data);
    const findOrganization = await this.cacheService.get(
      'organization',
      CachKey
    );
    if (findOrganization) {
      return findOrganization;
    } else {
      const include = buildIncludeVersion(includeConfigVersion, data);

      const where = {
        status: 0,
        name: data.search
          ? { contains: data.search, mode: Prisma.QueryMode.insensitive }
          : undefined,
        createdBy:
          data.createdBy == CreatedByEnum.All ? undefined : data.createdBy,
      };
      if (data.all) {
        const organizations = await this.prisma.organizationVersion.findMany({
          where,
          orderBy: { name: 'desc' },
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
        this.logger.debug(`Method: ${methodName} - Response: `, result);
        await this.cacheService.setAll('organization', CachKey, {
          data: result,
          totalDocs: organizations.length,
          totalPage: organizations.length > 0 ? 1 : 0,
        });
        return {
          data: result,
          totalDocs: organizations.length,
          totalPage: organizations.length > 0 ? 1 : 0,
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
        orderBy: { name: 'desc' },
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
      this.logger.debug(`Method: ${methodName} - Response: `, result);
      await this.cacheService.setAll('organization', CachKey, {
        data: result,
        totalPage: pagination.totalPage,
        totalDocs: count,
      });
      return {
        data: result,
        totalPage: pagination.totalPage,
        totalDocs: count,
      };
    }
  }

  async findObjectAdress(data: ObjectAdressFilterDto) {
    const methodName: string = this.findObjectAdress.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);

    if (data.module == 'street') {
      const where: any = {
        ...(data.status == 2
          ? {}
          : {
              status: data.status,
            }),
      };

      const count = await this.prisma.street.count({
        where,
      });

      const pagination = createPagination({
        count,
        page: data.page,
        perPage: data.limit,
      });
      const streets = await getOrderedDataWithDistrict(
        'Street',
        'street',
        this.prisma,
        data,
        pagination
      );

      const formattedStreet = [];

      for (let i = 0; i < streets.length; i++) {
        let streetData = streets[i];
        const translations = streetData.StreetTranslations;
        const name = formatLanguageResponse(translations);
        const translationsNew = streetData.StreetNewNameTranslations;
        const nameNew = formatLanguageResponse(translationsNew);
        const translationsOld = streetData.StreetOldNameTranslations;
        const nameOld = formatLanguageResponse(translationsOld);

        delete streetData.StreetTranslations;
        delete streetData.StreetNewNameTranslations;
        delete streetData.StreetOldNameTranslations;

        const regionTranslations = streetData.region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete streetData.region.RegionTranslations;
        const region = { ...streetData.region, name: regionName };
        delete streetData.region;

        const cityTranslations = streetData.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete streetData.city.CityTranslations;
        const city = { ...streetData.city, name: cityName };
        delete streetData.city;
        if (streetData?.district) {
          const districtData = streetData?.district;
          let districtName: string | object;
          let districtNameNew: string | object;
          let districtNameOld: string | object;

          if (districtData) {
            const districtTranslations = districtData.DistrictTranslations;
            districtName = formatLanguageResponse(districtTranslations);
            const districtTranslationsNew =
              districtData.DistrictNewNameTranslations;
            districtNameNew = formatLanguageResponse(districtTranslationsNew);
            const districtTranslationsOld =
              districtData.DistrictOldNameTranslations;
            districtNameOld = formatLanguageResponse(districtTranslationsOld);
            delete districtData.DistrictTranslations;
            delete districtData.DistrictNewNameTranslations;
            delete districtData.DistrictOldNameTranslations;
          }

          const district = {
            ...districtData,
            name: districtName,
            newName: districtNameNew,
            oldName: districtNameOld,
          };
          streetData = {
            ...streetData,
            district,
          };
        }
        formattedStreet.push({
          ...streetData,
          name,
          newName: nameNew,
          oldName: nameOld,
          region,
          city,
        });
      }
      this.logger.debug(`Method: ${methodName} - Response: `, formattedStreet);

      return {
        data: formattedStreet,
        totalDocs: pagination.totalPage,
        totalPage: count,
      };
    }

    if (data.module == 'area') {
      const where: any = {
        ...(data.status == 2
          ? {}
          : {
              status: data.status,
            }),
      };

      const count = await this.prisma.area.count({
        where,
      });

      const pagination = createPagination({
        count,
        page: data.page,
        perPage: data.limit,
      });
      let areas = await getOrderedDataWithDistrict(
        'Area',
        'area',
        this.prisma,
        data,
        pagination
      );

      const formattedArea = [];

      for (let i = 0; i < areas.length; i++) {
        let areaData = areas[i];
        const translations = areaData.AreaTranslations;
        const name = formatLanguageResponse(translations);
        const translationsNew = areaData.AreaNewNameTranslations;
        const nameNew = formatLanguageResponse(translationsNew);
        const translationsOld = areaData.AreaOldNameTranslations;
        const nameOld = formatLanguageResponse(translationsOld);
        delete areaData.AreaTranslations;
        delete areaData.AreaNewNameTranslations;
        delete areaData.AreaOldNameTranslations;

        const regionTranslations = areaData.region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete areaData.region.RegionTranslations;
        const region = { ...areaData.region, name: regionName };
        delete areaData.region;

        const cityTranslations = areaData.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete areaData.city.CityTranslations;
        const city = { ...areaData.city, name: cityName };
        delete areaData.city;

        if (areaData?.district) {
          const districtData = areaData?.district;
          let districtName: string | object;
          let districtNameNew: string | object;
          let districtNameOld: string | object;

          if (districtData) {
            const districtTranslations = districtData.DistrictTranslations;
            districtName = formatLanguageResponse(districtTranslations);
            const districtTranslationsNew =
              districtData.DistrictNewNameTranslations;
            districtNameNew = formatLanguageResponse(districtTranslationsNew);
            const districtTranslationsOld =
              districtData.DistrictOldNameTranslations;
            districtNameOld = formatLanguageResponse(districtTranslationsOld);
            delete districtData.DistrictTranslations;
            delete districtData.DistrictNewNameTranslations;
            delete districtData.DistrictOldNameTranslations;
          }

          const district = {
            ...districtData,
            name: districtName,
            newName: districtNameNew,
            oldName: districtNameOld,
          };

          areaData = {
            ...areaData,
            district,
          };
        }

        formattedArea.push({
          ...areaData,
          name,
          newName: nameNew,
          oldName: nameOld,
          region,
          city,
        });
      }

      this.logger.debug(`Method: ${methodName} -  Response: `, formattedArea);
      return {
        data: formattedArea,
        totalDocs: areas.length,
        totalPage: areas.length > 0 ? 1 : 0,
      };
    }

    if (data.module == 'lane') {
      const where: any = {
        ...(data.status == 2
          ? {}
          : {
              status: data.status,
            }),
      };
      const count = await this.prisma.lane.count({
        where,
      });

      const pagination = createPagination({
        count,
        page: data.page,
        perPage: data.limit,
      });
      const lanes = await getOrderedDataWithDistrict(
        'Lane',
        'lane',
        this.prisma,
        data,
        pagination
      );

      const formattedLane = [];

      for (let i = 0; i < lanes.length; i++) {
        let laneData = lanes[i];
        const translations = laneData.LaneTranslations;
        const name = formatLanguageResponse(translations);
        const translationsNew = laneData.LaneNewNameTranslations;
        const nameNew = formatLanguageResponse(translationsNew);
        const translationsOld = laneData.LaneOldNameTranslations;
        const nameOld = formatLanguageResponse(translationsOld);
        delete laneData.LaneTranslations;
        delete laneData.LaneNewNameTranslations;
        delete laneData.LaneOldNameTranslations;

        const regionTranslations = laneData.region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete laneData.region.RegionTranslations;
        const region = { ...laneData.region, name: regionName };
        delete laneData.region;

        const cityTranslations = laneData.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete laneData.city.CityTranslations;
        const city = { ...laneData.city, name: cityName };
        delete laneData.city;
        if (laneData?.district) {
          const districtData = laneData?.district;
          let districtName: string | object;
          let districtNameNew: string | object;
          let districtNameOld: string | object;

          if (districtData) {
            const districtTranslations = districtData.DistrictTranslations;
            districtName = formatLanguageResponse(districtTranslations);
            const districtTranslationsNew =
              districtData.DistrictNewNameTranslations;
            districtNameNew = formatLanguageResponse(districtTranslationsNew);
            const districtTranslationsOld =
              districtData.DistrictOldNameTranslations;
            districtNameOld = formatLanguageResponse(districtTranslationsOld);
            delete districtData.DistrictTranslations;
            delete districtData.DistrictNewNameTranslations;
            delete districtData.DistrictOldNameTranslations;
          }

          const district = {
            ...districtData,
            name: districtName,
            newName: districtNameNew,
            oldName: districtNameOld,
          };
          laneData = {
            ...laneData,
            district,
          };
        }
        this.logger.debug(`Method: ${methodName} -  Response: `, laneData);

        formattedLane.push({
          ...laneData,
          name,
          newName: nameNew,
          oldName: nameOld,
          region,
          city,
        });
      }

      return {
        data: formattedLane,
        totalPage: pagination.totalPage,
        totalDocs: count,
      };
    }

    if (data.module == 'residential-area') {
      const where: any = {
        ...(data.status == 2
          ? {}
          : {
              status: data.status,
            }),
      };

      const count = await this.prisma.residentialArea.count({
        where,
      });

      const pagination = createPagination({
        count,
        page: data.page,
        perPage: data.limit,
      });

      let residentialAreas = await getOrderedDataWithDistrict(
        'ResidentialArea',
        'residential_area',
        this.prisma,
        data,
        pagination
      );

      const formattedResidentialArea = [];

      for (let i = 0; i < residentialAreas.length; i++) {
        let residentialAreaData = residentialAreas[i];
        const translations = residentialAreaData.ResidentialAreaTranslations;
        const name = formatLanguageResponse(translations);
        const translationsNew =
          residentialAreaData.ResidentialAreaNewNameTranslations;
        const nameNew = formatLanguageResponse(translationsNew);
        const translationsOld =
          residentialAreaData.ResidentialAreaOldNameTranslations;
        const nameOld = formatLanguageResponse(translationsOld);
        delete residentialAreaData.ResidentialAreaTranslations;
        delete residentialAreaData.ResidentialAreaNewNameTranslations;
        delete residentialAreaData.ResidentialAreaOldNameTranslations;

        const regionTranslations =
          residentialAreaData.region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete residentialAreaData.region.RegionTranslations;
        const region = { ...residentialAreaData.region, name: regionName };
        delete residentialAreaData.region;

        const cityTranslations = residentialAreaData.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete residentialAreaData.city.CityTranslations;
        const city = { ...residentialAreaData.city, name: cityName };
        delete residentialAreaData.city;
        if (residentialAreaData?.district) {
          const districtData = residentialAreaData?.district;
          let districtName: string | object;
          let districtNameNew: string | object;
          let districtNameOld: string | object;

          if (districtData) {
            const districtTranslations = districtData.DistrictTranslations;
            districtName = formatLanguageResponse(districtTranslations);
            const districtTranslationsNew =
              districtData.DistrictNewNameTranslations;
            districtNameNew = formatLanguageResponse(districtTranslationsNew);
            const districtTranslationsOld =
              districtData.DistrictOldNameTranslations;
            districtNameOld = formatLanguageResponse(districtTranslationsOld);
            delete districtData.DistrictTranslations;
            delete districtData.DistrictNewNameTranslations;
            delete districtData.DistrictOldNameTranslations;
          }

          const district = {
            ...districtData,
            name: districtName,
            newName: districtNameNew,
            oldName: districtNameOld,
          };
          residentialAreaData = {
            ...residentialAreaData,
            district,
          };
        }
        formattedResidentialArea.push({
          ...residentialAreaData,
          name,
          newName: nameNew,
          oldName: nameOld,

          region,
          city,
        });
      }
      this.logger.debug(
        `Method: ${methodName} - Response: `,
        formattedResidentialArea
      );

      return {
        data: formattedResidentialArea,
        totalPage: pagination.totalPage,
        totalDocs: count,
      };
    }

    if (data.module == 'neighborhood') {
      const where: any = {
        ...(data.status == 2
          ? {}
          : {
              status: data.status,
            }),
      };
      const count = await this.prisma.neighborhood.count({
        where,
      });

      const pagination = createPagination({
        count,
        page: data.page,
        perPage: data.limit,
      });
      let neighborhoods = await getOrderedDataWithDistrict(
        'Neighborhood',
        'neighborhood',
        this.prisma,
        data,
        pagination
      );

      const formattedNeighborhood = [];

      for (let i = 0; i < neighborhoods.length; i++) {
        let neighborhoodData = neighborhoods[i];
        const translations = neighborhoodData.NeighborhoodTranslations;
        const name = formatLanguageResponse(translations);
        const translationsNew =
          neighborhoodData.NeighborhoodNewNameTranslations;
        const nameNew = formatLanguageResponse(translationsNew);
        const translationsOld =
          neighborhoodData.NeighborhoodOldNameTranslations;
        const nameOld = formatLanguageResponse(translationsOld);
        delete neighborhoodData.NeighborhoodTranslations;
        delete neighborhoodData.NeighborhoodNewNameTranslations;
        delete neighborhoodData.NeighborhoodOldNameTranslations;

        const regionTranslations = neighborhoodData.region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete neighborhoodData.region.RegionTranslations;
        const region = { ...neighborhoodData.region, name: regionName };
        delete neighborhoodData.region;

        const cityTranslations = neighborhoodData.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete neighborhoodData.city.CityTranslations;
        const city = { ...neighborhoodData.city, name: cityName };
        delete neighborhoodData.city;
        if (neighborhoodData?.district) {
          const districtData = neighborhoodData?.district;
          let districtName: string | object;
          let districtNameNew: string | object;
          let districtNameOld: string | object;

          if (districtData) {
            const districtTranslations = districtData.DistrictTranslations;
            districtName = formatLanguageResponse(districtTranslations);
            const districtTranslationsNew =
              districtData.DistrictNewNameTranslations;
            districtNameNew = formatLanguageResponse(districtTranslationsNew);
            const districtTranslationsOld =
              districtData.DistrictOldNameTranslations;
            districtNameOld = formatLanguageResponse(districtTranslationsOld);
            delete districtData.DistrictTranslations;
            delete districtData.DistrictNewNameTranslations;
            delete districtData.DistrictOldNameTranslations;
          }

          const district = {
            ...districtData,
            name: districtName,
            newName: districtNameNew,
            oldName: districtNameOld,
          };
          neighborhoodData = {
            ...neighborhoodData,
            district,
          };
        }
        formattedNeighborhood.push({
          ...neighborhoodData,
          name,
          newName: nameNew,
          oldName: nameOld,
          region,
          city,
        });
      }
      this.logger.debug(
        `Method: ${methodName} - Response: `,
        formattedNeighborhood
      );

      return {
        data: formattedNeighborhood,
        totalPage: pagination.totalPage,
        totalDocs: count,
      };
    }

    if (data.module == 'impasse') {
      const where: any = {
        ...(data.status == 2
          ? {}
          : {
              status: data.status,
            }),
      };

      const count = await this.prisma.impasse.count({
        where,
      });

      const pagination = createPagination({
        count,
        page: data.page,
        perPage: data.limit,
      });
      let impasses = await getOrderedDataWithDistrict(
        'Impasse',
        'impasse',
        this.prisma,
        data,
        pagination
      );

      const formattedImpasse = [];

      for (let i = 0; i < impasses.length; i++) {
        let impasseData = impasses[i];
        const translations = impasseData.ImpasseTranslations;
        const name = formatLanguageResponse(translations);
        const translationsNew = impasseData.ImpasseNewNameTranslations;
        const nameNew = formatLanguageResponse(translationsNew);
        const translationsOld = impasseData.ImpasseOldNameTranslations;
        const nameOld = formatLanguageResponse(translationsOld);
        delete impasseData.ImpasseTranslations;
        delete impasseData.ImpasseNewNameTranslations;
        delete impasseData.ImpasseOldNameTranslations;

        const regionTranslations = impasseData.region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete impasseData.region.RegionTranslations;
        const region = { ...impasseData.region, name: regionName };
        delete impasseData.region;

        const cityTranslations = impasseData.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete impasseData.city.CityTranslations;
        const city = { ...impasseData.city, name: cityName };
        delete impasseData.city;

        if (impasseData?.district) {
          const districtData = impasseData?.district;
          let districtName: string | object;
          let districtNameNew: string | object;
          let districtNameOld: string | object;

          if (districtData) {
            const districtTranslations = districtData.DistrictTranslations;
            districtName = formatLanguageResponse(districtTranslations);
            const districtTranslationsNew =
              districtData.DistrictNewNameTranslations;
            districtNameNew = formatLanguageResponse(districtTranslationsNew);
            const districtTranslationsOld =
              districtData.DistrictOldNameTranslations;
            districtNameOld = formatLanguageResponse(districtTranslationsOld);
            delete districtData.DistrictTranslations;
            delete districtData.DistrictNewNameTranslations;
            delete districtData.DistrictOldNameTranslations;
          }

          const district = {
            ...impasseData.district,
            name: districtName,
            districtNameNew,
            districtNameOld,
          };
          impasseData = { ...impasseData, district };
        }
        this.logger.debug(`Method: ${methodName} -  Response: `, impasseData);

        formattedImpasse.push({
          ...impasseData,
          name,
          newName: nameNew,
          oldName: nameOld,
          region,
          city,
        });
      }

      return {
        data: formattedImpasse,
        totalPage: pagination.totalPage,
        totalDocs: count,
      };
    }

    if (data.module == 'avenue') {
      const where: any = {
        ...(data.status == 2
          ? {}
          : {
              status: data.status,
            }),
      };

      const count = await this.prisma.avenue.count({
        where,
      });

      const pagination = createPagination({
        count,
        page: data.page,
        perPage: data.limit,
      });
      let avenues = await getOrderedDataWithDistrict(
        'Avenue',
        'avenue',
        this.prisma,
        data,
        pagination
      );
      const formattedAvenue = [];

      for (let i = 0; i < avenues.length; i++) {
        let avenueData = avenues[i];
        const translations = avenueData.AvenueTranslations;
        const name = formatLanguageResponse(translations);
        const translationsNew = avenueData.AvenueNewNameTranslations;
        const nameNew = formatLanguageResponse(translationsNew);
        const translationsOld = avenueData.AvenueOldNameTranslations;
        const nameOld = formatLanguageResponse(translationsOld);
        delete avenueData.AvenueTranslations;
        delete avenueData.AvenueNewNameTranslations;
        delete avenueData.AvenueOldNameTranslations;

        const regionTranslations = avenueData.region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete avenueData.region.RegionTranslations;
        const region = { ...avenueData.region, name: regionName };
        delete avenueData.region;

        const cityTranslations = avenueData.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete avenueData.city.CityTranslations;
        const city = { ...avenueData.city, name: cityName };
        delete avenueData.city;
        if (avenueData?.district) {
          const districtData = avenueData?.district;
          let districtName: string | object;
          let districtNameNew: string | object;
          let districtNameOld: string | object;

          if (districtData) {
            const districtTranslations = districtData.DistrictTranslations;
            districtName = formatLanguageResponse(districtTranslations);
            const districtTranslationsNew =
              districtData.DistrictNewNameTranslations;
            districtNameNew = formatLanguageResponse(districtTranslationsNew);
            const districtTranslationsOld =
              districtData.DistrictOldNameTranslations;
            districtNameOld = formatLanguageResponse(districtTranslationsOld);
            delete districtData.DistrictTranslations;
            delete districtData.DistrictNewNameTranslations;
            delete districtData.DistrictOldNameTranslations;
          }

          const district = {
            ...avenueData.district,
            name: districtName,
            districtNameNew,
            districtNameOld,
          };
          avenueData = {
            ...avenueData,
            district,
          };
        }
        formattedAvenue.push({
          ...avenueData,
          name,
          newName: nameNew,
          oldName: nameOld,
          region,
          city,
        });
      }

      this.logger.debug(`Method: ${methodName} - Response: `, formattedAvenue);

      return {
        data: formattedAvenue,
        totalPage: pagination.totalPage,
        totalDocs: count,
      };
    }

    if (data.module == 'passage') {
      const where: any = {
        ...(data.status == 2
          ? {}
          : {
              status: data.status,
            }),
      };

      const count = await this.prisma.passage.count({
        where,
      });

      const pagination = createPagination({
        count,
        page: data.page,
        perPage: data.limit,
      });
      let passages = await getOrderedDataWithDistrict(
        'Passage',
        'passage',
        this.prisma,
        data,
        pagination
      );

      const formattedPassage = [];

      for (let i = 0; i < passages.length; i++) {
        let passageData = passages[i];
        const translations = passageData.PassageTranslations;
        const name = formatLanguageResponse(translations);
        const translationsNew = passageData.PassageNewNameTranslations;
        const nameNew = formatLanguageResponse(translationsNew);
        const translationsOld = passageData.PassageOldNameTranslations;
        const nameOld = formatLanguageResponse(translationsOld);
        delete passageData.PassageTranslations;
        delete passageData.PassageNewNameTranslations;
        delete passageData.PassageOldNameTranslations;

        const regionTranslations = passageData.region.RegionTranslations;
        const regionName = formatLanguageResponse(regionTranslations);
        delete passageData.region.RegionTranslations;
        const region = { ...passageData.region, name: regionName };
        delete passageData.region;

        const cityTranslations = passageData.city.CityTranslations;
        const cityName = formatLanguageResponse(cityTranslations);
        delete passageData.city.CityTranslations;
        const city = { ...passageData.city, name: cityName };
        delete passageData.city;
        if (passageData?.district) {
          const districtData = passageData?.district;
          let districtName: string | object;
          let districtNameNew: string | object;
          let districtNameOld: string | object;

          if (districtData) {
            const districtTranslations = districtData.DistrictTranslations;
            districtName = formatLanguageResponse(districtTranslations);
            const districtTranslationsNew =
              districtData.DistrictNewNameTranslations;
            districtNameNew = formatLanguageResponse(districtTranslationsNew);
            const districtTranslationsOld =
              districtData.DistrictOldNameTranslations;
            districtNameOld = formatLanguageResponse(districtTranslationsOld);
            delete districtData.DistrictTranslations;
            delete districtData.DistrictNewNameTranslations;
            delete districtData.DistrictOldNameTranslations;
          }

          const district = {
            ...passageData.district,
            name: districtName,
            districtNameNew,
            districtNameOld,
          };
          passageData = { ...passageData, district };
        }

        formattedPassage.push({
          ...passageData,
          name,
          newName: nameNew,
          oldName: nameOld,
          region,
          city,
        });
      }
      this.logger.debug(`Method: ${methodName} - Response: `, formattedPassage);

      return {
        data: formattedPassage,
        totalPage: pagination.totalPage,
        totalDocs: count,
      };
    }
  }

  async findOne(data: GetOneDto): Promise<OrganizationInterfaces.Response> {
    const methodName: string = this.findOne.name;
    this.logger.debug(`Method: ${methodName} - Request: `, data);
    const include = buildInclude(includeConfig, data);
    const findCategory = await this.cacheService.get(
      'organizationOne',
      data.id?.toString()
    );

    console.log(include, 'INCLUDE');

    const organization = await this.prisma.organization.findFirst({
      where: {
        id: data.id,
      },
      orderBy: { name: 'asc' },
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
    if (data.role !== 'moderator') {
      delete formattedOrganization.secret;
    }
    this.logger.debug(
      `Method: ${methodName} - Response: `,
      formattedOrganization
    );
    if (findCategory) {
      console.log(findCategory, 'findCategory');

      return findCategory;
    } else {
      const organization = await this.prisma.organization.findFirst({
        where: {
          id: data.id,
        },
        orderBy: { name: 'asc' },
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
      if (data.role !== 'moderator') {
        delete formattedOrganization.secret;
      }
      this.logger.debug(
        `Method: ${methodName} - Response: `,
        formattedOrganization
      );
      await this.cacheService.set(
        'organizationOne',
        data.id?.toString(),
        formattedOrganization
      );
      return formattedOrganization;
    }
  }

  async update(id: number): Promise<OrganizationInterfaces.Response> {
    const methodName: string = this.update.name;

    this.logger.debug(`Method: ${methodName} - Request: `, id);
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
        neighborhoodId: organizationVersion.neighborhoodId,
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
        editedStaffNumber: organizationVersion.editedStaffNumber,
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
    this.logger.debug(`Method: ${methodName} - Response: `, UpdateOrganization);
    await this.cacheService.delete(
      'organizationOne',
      UpdateOrganization.id?.toString()
    );
    await this.cacheService.invalidateAllCaches('organization');

    return UpdateOrganization;
  }

  async updateCheck(data: ConfirmDto): Promise<any> {
    const methodName: string = this.updateCheck.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
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
          const UpdateVersion = await this.prisma.organizationVersion.update({
            where: {
              id: organizationVersion.id,
            },
            data: {
              status: OrganizationStatusEnum.Accepted,
              rejectReason: data.rejectReason,
            },
          });
          this.logger.debug(
            `Method: ${methodName} - Response: `,
            UpdateVersion
          );

          return await this.update(data.id);
        } else if (
          organizationVersion.method == OrganizationMethodEnum.Create
        ) {
          const UpdateVersion = await this.prisma.organizationVersion.update({
            where: {
              id: organizationVersion.id,
            },
            data: {
              status: OrganizationStatusEnum.Accepted,
              rejectReason: data.rejectReason,
            },
          });

          this.logger.debug(
            `Method: ${methodName} - Response: `,
            UpdateVersion
          );
          const updateOrg = await this.prisma.organization.update({
            where: {
              id: organizationVersion.organizationId,
            },
            data: {
              status: OrganizationStatusEnum.Accepted,
            },
          });

          await this.cacheService.delete(
            'organizationOne',
            data.id?.toString()
          );

          await this.cacheService.invalidateAllCaches('organization');

          return updateOrg;
        } else if (
          organizationVersion.method == OrganizationMethodEnum.Delete
        ) {
          const UpdateVersion = await this.prisma.organizationVersion.update({
            where: {
              id: organizationVersion.id,
            },
            data: {
              status: OrganizationStatusEnum.Deleted,
              rejectReason: data.rejectReason,
            },
          });

          this.logger.debug(
            `Method: ${methodName} - Response: `,
            UpdateVersion
          );
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
          const UpdateVersion = await this.prisma.organizationVersion.update({
            where: {
              id: organizationVersion.id,
            },
            data: {
              status: OrganizationStatusEnum.Accepted,
              rejectReason: data.rejectReason,
            },
          });

          this.logger.debug(
            `Method: ${methodName} - Response: `,
            UpdateVersion
          );
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

        const UpdateVersion = await this.prisma.organizationVersion.update({
          where: {
            id: organizationVersion.id,
          },
          data: {
            status: OrganizationStatusEnum.Rejected,
            rejectReason: data.rejectReason,
          },
        });

        this.logger.debug(`Method: ${methodName} - Response: `, UpdateVersion);
        await this.cacheService.delete('organizationOne', data.id?.toString());

        await this.cacheService.invalidateAllCaches('organization');
        return UpdateVersion;
      }
    }
  }

  async remove(
    data: OrganizationDeleteDto
  ): Promise<OrganizationInterfaces.Response> {
    const methodName: string = this.remove.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
    if (!data.delete) {
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
        const UpdateVersion = await this.prisma.organizationVersion.update({
          where: {
            id: organizationVersion.id,
          },
          data: {
            status: OrganizationStatusEnum.Deleted,
            deleteReason: data.deleteReason,
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

        this.logger.debug(`Method: ${methodName} - Request: `, UpdateVersion);

        const UpdateOrg = await this.prisma.organization.update({
          where: {
            id: organizationVersion.id,
          },
          data: {
            deleteReason: data.deleteReason,
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
        this.logger.debug(`Method: ${methodName} - Request: `, UpdateOrg);

        await this.cacheService.delete(
          'organizationOne',
          UpdateOrg.id?.toString()
        );
        await this.cacheService.invalidateAllCaches('organization');
        return UpdateOrg;
      } else {
        const UpdateVersion = await this.prisma.organizationVersion.update({
          where: {
            id: organizationVersion.id,
          },
          data: {
            status: OrganizationStatusEnum.Check,
            deleteReason: data.deleteReason,
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
        this.logger.debug(`Method: ${methodName} - Response: `, UpdateVersion);

        return UpdateVersion;
      }
    }
  }

  async restore(
    data: OrganizationRestoreDto
  ): Promise<OrganizationInterfaces.Response> {
    const methodName: string = this.restore.name;

    this.logger.debug(`Method: ${methodName} - Request: `, data);
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
      const UpdateOrgVersion = await this.prisma.organizationVersion.update({
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
      this.logger.debug(`Method: ${methodName} - Response: `, UpdateOrgVersion);

      const UpdateOrg = await this.prisma.organization.update({
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

      this.logger.debug(`Method: ${methodName} - Response: `, UpdateOrg);
      await this.cacheService.delete(
        'organizationOne',
        UpdateOrg.id?.toString()
      );
      await this.cacheService.invalidateAllCaches('organization');
      return UpdateOrg;
    } else {
      const UpdateOrgVersion = await this.prisma.organizationVersion.update({
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
      this.logger.debug(`Method: ${methodName} - Response: `, UpdateOrgVersion);
      return UpdateOrgVersion;
    }
  }
}
