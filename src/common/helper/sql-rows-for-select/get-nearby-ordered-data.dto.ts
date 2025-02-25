import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export async function getNearbyOrderedData(
  CapitalizaName: string,
  name: string,
  prisma: PrismaService,
  data: any,
  pagination?: { take: number; skip: number }
) {
  const conditions: Prisma.Sql[] = [];
  if (data.status === 0 || data.status === 1)
    conditions.push(Prisma.sql`c.status = ${data.status}`);
  if (data.search) {
    conditions.push(Prisma.sql`
              EXISTS (
                SELECT 1
                FROM nearby_translations ct
                WHERE ct.nearby_id = c.id
                  AND ct.name ILIKE ${`%${data.search}%`}
                ORDER BY ct.language_code   
                LIMIT 1
              )
            `);
  }
  if (data.nearbyCategoryId) {
    conditions.push(
      Prisma.sql`c.nearby_category_id = ${data.nearbyCategoryId}`
    );
  }
  if (data.cityId) conditions.push(Prisma.sql`c.city_id = ${data.cityId}`);
  if (data.regionId)
    conditions.push(Prisma.sql`c.region_id = ${data.regionId}`);
  if (data.districtId)
    conditions.push(Prisma.sql`c.district_id = ${data.districtId}`);
  const whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  const result: any = await prisma.$queryRaw(
    Prisma.sql`
        WITH
            ${Prisma.raw(CapitalizaName)}Translations AS (
                SELECT
                    ct.${Prisma.raw(`${name}_id`)},
                    JSON_AGG(
                        JSONB_BUILD_OBJECT(
                            'languageCode', ct.language_code,
                            'name', ct.name
                        )
                    )::JSONB AS Translations  
                FROM ${Prisma.raw(name + '_translations')} ct
               GROUP BY ct.${Prisma.raw(`${name}_id`)}
            ),
            CityTranslations AS (
                SELECT
                    cyt.city_id,
                    JSON_AGG(
                        JSONB_BUILD_OBJECT(
                            'languageCode', cyt.language_code,
                            'name', cyt.name
                        )
                    )::JSONB AS Translations  
                FROM city_translations cyt
               GROUP BY cyt.city_id
            ),
            RegionTranslations AS (
                SELECT
                    rt.region_id,
                    JSON_AGG(
                        JSONB_BUILD_OBJECT(
                            'languageCode', rt.language_code,
                            'name', rt.name
                        )
                    )::JSONB AS Translations  
                FROM region_translations rt
               GROUP BY rt.region_id
            ),
            DistrictTranslations AS (
                SELECT
                    dt.district_id,
                    JSON_AGG(
                        JSONB_BUILD_OBJECT(
                            'languageCode', dt.language_code,
                            'name', dt.name
                        )
                    )::JSONB AS Translations  
                FROM district_translations dt
                GROUP BY dt.district_id
            ),
            DistrictNewNameTranslations AS (
                SELECT
                    dnnt.district_id,
                    JSON_AGG(
                        JSONB_BUILD_OBJECT(
                            'languageCode', dnnt.language_code,
                            'name', dnnt.name
                        )
                    )::JSONB AS Translations  
                FROM district_new_name_translations dnnt
                GROUP BY dnnt.district_id
            ),
            DistrictOldNameTranslations AS (
                SELECT
                    dont.district_id,
                    JSON_AGG(
                        JSONB_BUILD_OBJECT(
                            'languageCode', dont.language_code,
                            'name', dont.name
                        )
                    )::JSONB AS Translations  
                FROM district_old_name_translations dont
                GROUP BY dont.district_id
            )
        SELECT
            c.*,  
            (SELECT Translations FROM ${Prisma.raw(CapitalizaName)}Translations WHERE ${Prisma.raw(`${name}_id`)} = c.id) AS "${Prisma.raw(CapitalizaName)}Translations",
            JSONB_SET(
                ROW_TO_JSON(city)::JSONB,  
                '{CityTranslations}', 
                COALESCE(
                    (SELECT Translations FROM CityTranslations WHERE city_id = city.id), 
                    '[]'::JSONB
                )
            ) AS City,
            JSONB_SET(
                ROW_TO_JSON(region)::JSONB,  
                '{RegionTranslations}', 
                COALESCE(
                    (SELECT Translations FROM RegionTranslations WHERE region_id = region.id), 
                    '[]'::JSONB
                )
            ) AS Region,
            ROW_TO_JSON(nearby_category)::JSONB AS NearbyCategory,
            JSONB_SET(
            JSONB_SET(
                JSONB_SET(
                    ROW_TO_JSON(district)::JSONB,  
                    '{DistrictTranslations}', 
                    COALESCE((SELECT Translations FROM DistrictTranslations WHERE district_id = district.id), '[]'::JSONB)
                ),
                '{DistrictNewNameTranslations}', 
                COALESCE((SELECT Translations FROM DistrictNewNameTranslations WHERE district_id = district.id), '[]'::JSONB)
            ),
            '{DistrictOldNameTranslations}', 
            COALESCE((SELECT Translations FROM DistrictOldNameTranslations WHERE district_id = district.id), '[]'::JSONB)
             ) AS District
        FROM
            ${Prisma.raw(name)} c
        LEFT JOIN city ON c.city_id = city.id
        LEFT JOIN region ON city.region_id = region.id
        LEFT JOIN nearby_category ON c.nearby_category_id = nearby_category.id
        LEFT JOIN district ON c.district_id = district.id
        ${whereClause}
        GROUP BY 
            c.id, city.id, region.id, nearby_category.id, district.id
        ${
          data.order === 'name'
            ? Prisma.raw(`ORDER BY
            (
                SELECT jsonb_extract_path_text(
                    jsonb_path_query_first(
                        Translations, 
                        '$[*] ? (@.languageCode == "${data.langCode ? data.langCode : 'ru'}")'
                    )::jsonb, 'name'
                )
                FROM ${CapitalizaName}Translations
                WHERE ${`${name}_id`} = c.id
            ) ASC, c.order_number ASC`)
            : Prisma.raw(`
                ORDER BY 
                c.order_number ASC, 
                (
                    SELECT jsonb_extract_path_text(
                    jsonb_path_query_first(
                        Translations, 
                        '$[*] ? (@.languageCode == "${data.langCode ? data.langCode : 'ru'}")'
                    )::jsonb, 'name'
                    )   
                    FROM ${CapitalizaName}Translations
                    WHERE ${name}_id = c.id
                ) ASC
            `)
        }
        ${pagination ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}` : Prisma.empty}
    `
  );
  return result;
}
