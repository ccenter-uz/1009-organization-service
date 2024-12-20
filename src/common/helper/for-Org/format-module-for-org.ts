import { formatLanguageResponse } from '../format-language.helper';

interface Translations {
  languageCode: string;
  name: string;
}

interface FormatOptions {
  nameKey: string; // Например, "Area"
  includeKeys?: string[]; // Ключи, которые нужно включать, например: ["NewNameTranslations", "OldNameTranslations"]
}

function formatModuleTranslations(module: any, options: FormatOptions): any {
  const { nameKey, includeKeys = [] } = options;
  const result: any = { ...module };

  // Форматируем базовый перевод
  const baseTranslationsKey = `${nameKey}Translations`;
  if (module[baseTranslationsKey]) {
    result.name = formatLanguageResponse(module[baseTranslationsKey]);
    delete result[baseTranslationsKey];
  }

  // Форматируем дополнительные переводы
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

export default function formatOrganizationResponse(
  organization: any,
  modulesConfig: FormatOptions[]
): any {
  const formattedOrganization = { ...organization };

  for (const config of modulesConfig) {
    const moduleKey = config.nameKey;
    if (formattedOrganization[moduleKey]) {
      formattedOrganization[moduleKey.toLowerCase()] = formatModuleTranslations(
        formattedOrganization[moduleKey],
        config
      );
      delete formattedOrganization[moduleKey];
    }
  }

  return formattedOrganization;
}


export const modulesConfig = [
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
    nameKey: 'SubCategory',
    includeKeys: ['SubCategoryTranslations'],
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
    includeKeys: ['SegmentTranslations'],
  },
  {
    nameKey: 'Nearby',
    includeKeys: ['NearbyTranslations'],
  },
  {
    nameKey: 'Section',
    includeKeys: [],
  },
];