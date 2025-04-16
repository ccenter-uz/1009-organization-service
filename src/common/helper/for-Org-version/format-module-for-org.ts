import { formatLanguageResponse } from '../format-language.helper';

interface Translations {
  languageCode: string;
  name: string;
}

interface FormatOptions {
  nameKey: string;
  includeKeys?: string[];
}

function formatModuleTranslationsVersion(
  module: any,
  options: FormatOptions
): any {
  const { nameKey, includeKeys = [] } = options;
  const result: any = { ...module };

  const baseTranslationsKey = `${nameKey}Translations`;
  if (module[baseTranslationsKey]) {
    result.name = formatLanguageResponse(module[baseTranslationsKey]);
    delete result[baseTranslationsKey];
  }

  for (const key of includeKeys) {
    const translationsKey = `${nameKey}${key}`;
    if (module[translationsKey]) {
      result[
        key == 'NewNameTranslations'
          ? 'newName'
          : key == 'OldNameTranslations'
            ? 'oldName'
            : key
      ] = formatLanguageResponse(module[translationsKey]);
      delete result[translationsKey];
    }
  }

  return result;
}

export default function formatOrganizationResponseVersion(
  organization: any,
  modulesConfig: FormatOptions[]
): any {
  const formattedOrganization = { ...organization };

  for (const config of modulesConfig) {
    const moduleKey = config.nameKey;
    if (formattedOrganization[moduleKey]) {
      formattedOrganization[moduleKey.toLowerCase()] =
        formatModuleTranslationsVersion(
          formattedOrganization[moduleKey],
          config
        );
      delete formattedOrganization[moduleKey];
    }
  }

  for (let [index, el] of Object.entries(organization['PhoneVersion'])) {
    if (el['PhoneTypes']?.PhoneTypesTranslations) {
      const name = formatLanguageResponse(
        el['PhoneTypes']?.PhoneTypesTranslations
      );
      formattedOrganization['PhoneVersion'][index]['PhoneTypes'].name = name;
      delete formattedOrganization['PhoneVersion'][index]['PhoneTypes']
        .PhoneTypesTranslations;

      // change
    }
  }

  for (let [index, el] of Object.entries(organization['NearbeesVersion'])) {
    const name = formatLanguageResponse(el['Nearby'].NearbyTranslations);

    formattedOrganization['NearbeesVersion'][index]['NearbyCategory'] = {
      ...el['Nearby'].NearbyCategory,
    };

    delete formattedOrganization['NearbeesVersion'][index]['Nearby']
      .NearbyCategory;

    formattedOrganization['NearbeesVersion'][index]['Nearby'].name = name;
    delete formattedOrganization['NearbeesVersion'][index]['Nearby']
      .NearbyTranslations;
  }

  for (let [index, el] of Object.entries(
    organization['ProductServicesVersion']
  )) {
    const nameOfProductServiceCategory = formatLanguageResponse(
      el['ProductServiceCategory']['ProductServiceCategoryTranslations']
    );
    const nameOfProductServiceSubCategory = formatLanguageResponse(
      el['ProductServiceSubCategory']['ProductServiceSubCategoryTranslations']
    );

    formattedOrganization['ProductServicesVersion'][index][
      'ProductServiceSubCategory'
    ].name = nameOfProductServiceSubCategory;
    formattedOrganization['ProductServicesVersion'][index][
      'ProductServiceCategory'
    ].name = nameOfProductServiceCategory;

    delete formattedOrganization['ProductServicesVersion'][index][
      'ProductServiceSubCategory'
    ]['ProductServiceSubCategoryTranslations'];
    delete formattedOrganization['ProductServicesVersion'][index][
      'ProductServiceCategory'
    ]['ProductServiceCategoryTranslations'];
  }

  const subCategoryTranslation =
    organization?.SubCategory?.SubCategoryTranslations;
  const categoryTranslation =
    organization?.SubCategory?.category?.CategoryTranslations;

  if (subCategoryTranslation) {
    const subCategoryName = formatLanguageResponse(subCategoryTranslation);
    formattedOrganization.SubCategory.name = subCategoryName;

    formattedOrganization.subcategory = organization.SubCategory;

    if (categoryTranslation) {
      const categoryName = formatLanguageResponse(categoryTranslation);
      formattedOrganization.SubCategory.category.name = categoryName;
      formattedOrganization.category =
        formattedOrganization.SubCategory.category;
      delete formattedOrganization.SubCategory.category.CategoryTranslations;
      delete formattedOrganization.subcategory.category;
    }

    delete formattedOrganization.SubCategory.SubCategoryTranslations;
    delete formattedOrganization.SubCategory;
  }
  return { ...formattedOrganization };
}

export const modulesConfigVersion = [
  {
    nameKey: 'Area',
    includeKeys: ['NewNameTranslations', 'OldNameTranslations'],
  },
  {
    nameKey: 'Avenue',
    includeKeys: ['NewNameTranslations', 'OldNameTranslations'],
  },
  {
    nameKey: 'MainOrganization',
    includeKeys: [],
  },
  {
    nameKey: 'ProductServiceCategory',
    includeKeys: ['ProductServiceCategoryTranslations'],
  },
  {
    nameKey: 'ProductServiceSubCategory',
    includeKeys: ['ProductServiceSubCategoryTranslations'],
  },
  {
    nameKey: 'Region',
    includeKeys: ['RegionTranslations'],
  },
  {
    nameKey: 'City',
    includeKeys: ['CityTranslations'],
  },
  {
    nameKey: 'District',
    includeKeys: [
      'DistrictTranslations',
      'NewNameTranslations',
      'OldNameTranslations',
    ],
  },
  {
    nameKey: 'Village',
    includeKeys: [
      'VillageTranslations',
      'NewNameTranslations',
      'OldNameTranslations',
    ],
  },
  {
    nameKey: 'ResidentialArea',
    includeKeys: [
      'ResidentialAreaTranslations',
      'NewNameTranslations',
      'OldNameTranslations',
    ],
  },
  {
    nameKey: 'Neighborhood',
    includeKeys: [
      'NeighborhoodTranslations',
      'NewNameTranslations',
      'OldNameTranslations',
    ],
  },
  {
    nameKey: 'Street',
    includeKeys: [
      'StreetTranslations',
      'NewNameTranslations',
      'OldNameTranslations',
    ],
  },
  {
    nameKey: 'Lane',
    includeKeys: [
      'LaneTranslations',
      'OldNameTranslations',
      'NewNameTranslations',
    ],
  },
  {
    nameKey: 'Impasse',
    includeKeys: [
      'ImpasseTranslations',
      'NewNameTranslations',
      'OldNameTranslations',
    ],
  },
  {
    nameKey: 'Segment',
    includeKeys: [],
  },
  {
    nameKey: 'Nearby',
    includeKeys: ['NearbyTranslations'],
  },
];
