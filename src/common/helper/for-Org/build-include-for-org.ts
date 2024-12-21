

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

  // Добавляем статически включенные сущности, если нужно
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

  return include;
}

export const includeConfig = {
  MainOrganization: [],
  SubCategory: ['SubCategoryTranslations'],
  ProductServiceCategory: ['ProductServiceCategoryTranslations'],
  ProductServiceSubCategory: ['ProductServiceSubCategoryTranslations'],
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
  Nearby: ['NearbyTranslations'],
  Section: [],
};
