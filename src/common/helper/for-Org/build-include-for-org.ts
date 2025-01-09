import { CreatedByEnum } from 'types/global';
import { SubCategory } from './../../../../node_modules/.prisma/client/index.d';
interface IncludeConfig {
  [key: string]: string[];
}

export default function buildInclude(
  config: IncludeConfig,
  data: any
): Record<string, any> {
  const include: Record<string, any> = {};

  for (const [key, translations] of Object.entries(config)) {
    include[key] = {
      include: (translations as string[]).reduce(
        (acc: Record<string, any>, translationKey) => {
          acc[translationKey] = {
            where: data.allLang
              ? {}
              : {
                  languageCode: data.langCode,
                },
            select: {
              languageCode: true,
              name: true,
            },
          };
          return acc;
        },
        {}
      ),
    };
  }

  include.Picture = {
    select: {
      id: true,
      link: true,
      createdAt: true,
      updatedAt: true,
    },
  };
  include.PaymentTypes = {
    select: {
      id: true,
      Cash: true,
      Terminal: true,
      Transfer: true,
      createdAt: true,
      updatedAt: true,
    },
  };
  include.Phone = {
    where: {
      isSecret: data.role == CreatedByEnum.Moderator ? true : false,
    },
    include: {
      PhoneTypes: {
        select: {
          id: true,
          PhoneTypesTranslations: {
            where: data.allLang
              ? {}
              : {
                  languageCode: data.langCode,
                },
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
  };
  include.Nearbees = {
    include: {
      Nearby: {
        include: {
          NearbyTranslations: {
            where: data.allLang
              ? {}
              : {
                  languageCode: data.langCode,
                },
            select: {
              languageCode: true,
              name: true,
            },
          },
          NearbyCategory: true,
        },
      },
    },
  };
  include.ProductServices = {
    select: {
      ProductServiceCategory: {
        include: {
          ProductServiceCategoryTranslations: {
            where: data.allLang
              ? {}
              : {
                  languageCode: data.langCode, // langCode from request
                },
            select: {
              languageCode: true,
              name: true,
            },
          },
        },
      },
      ProductServiceSubCategory: {
        include: {
          ProductServiceSubCategoryTranslations: {
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
      },
    },
  };
  include.SubCategory = {
    include: {
      SubCategoryTranslations: true,
      category: {
        include: {
          CategoryTranslations: true,
        },
      },
    },
  };
  return include;
}

export const includeConfig = {
  MainOrganization: [],
  Region: ['RegionTranslations'],
  City: ['CityTranslations'],
  District: [
    'DistrictTranslations',
    'DistrictNewNameTranslations',
    'DistrictOldNameTranslations',
  ],
  Village: [
    'VillageTranslations',
    'VillageNewNameTranslations',
    'VillageOldNameTranslations',
  ],
  Avenue: [
    'AvenueTranslations',
    'AvenueNewNameTranslations',
    'AvenueOldNameTranslations',
  ],
  ResidentialArea: [
    'ResidentialAreaTranslations',
    'ResidentialAreaNewNameTranslations',
    'ResidentialAreaOldNameTranslations',
  ],
  Area: [
    'AreaTranslations',
    'AreaNewNameTranslations',
    'AreaOldNameTranslations',
  ],
  Street: [
    'StreetTranslations',
    'StreetNewNameTranslations',
    'StreetOldNameTranslations',
  ],
  Lane: [
    'LaneTranslations',
    'LaneNewNameTranslations',
    'LaneOldNameTranslations',
  ],
  Impasse: [
    'ImpasseTranslations',
    'ImpasseNewNameTranslations',
    'ImpasseOldNameTranslations',
  ],
  Segment: ['SegmentTranslations'],
};
