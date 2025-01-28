import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export async function getOrderedDataWithDistrict(
  CapitalizaName: string,
  name: string,
  prisma: PrismaService,
  data: any,
  pagination?: { take: number; skip: number }
) {
  const conditions: Prisma.Sql[] = [];
  if (data.status === 0 || data.status === 1)
    conditions.push(Prisma.sql`c.status = ${data.status}`);
  if (data.cityId) conditions.push(Prisma.sql`c.city_id = ${data.cityId}`);
  if (data.regionId)
    conditions.push(Prisma.sql`c.region_id = ${data.regionId}`);
  if (data.search) {
    if (data.langCode) {
      conditions.push(Prisma.sql`
                    EXISTS (
                      SELECT 1
                      FROM ${name}_translations ct
                      WHERE ct.${name}_id = c.id
                        AND ct.language_code = ${data.langCode}
                        AND ct.name ILIKE ${`%${data.search}%`}
                    )
                  `);
    } else {
      conditions.push(Prisma.sql`
                    EXISTS (
                      SELECT 1
                      FROM ${name}_translations ct
                      WHERE ct.${name}_id = c.id
                        AND ct.name ILIKE ${`%${data.search}%`}
                      ORDER BY ct.language_code   
                      LIMIT 1
                    )
                  `);
    }
  }

  const whereClause =
    conditions?.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;
  console.log(data.order);

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
                WHERE (${data.allLang} = TRUE OR 
                    ${data.langCode ? Prisma.sql`ct.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
                GROUP BY ct.${Prisma.raw(`${name}_id`)}
            ),
            ${Prisma.raw(CapitalizaName)}NewNameTranslations AS (
                SELECT
                    cnt.${Prisma.raw(`${name}_id`)},
                    JSON_AGG(
                        JSONB_BUILD_OBJECT(
                            'languageCode', cnt.language_code,
                            'name', cnt.name
                        )
                    )::JSONB AS NewNameTranslations  
                FROM ${Prisma.raw(name + '_new_name_translations')} cnt
                WHERE (${data.allLang} = TRUE OR 
                    ${data.langCode ? Prisma.sql`cnt.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
                GROUP BY cnt.${Prisma.raw(`${name}_id`)}
            ),
            ${Prisma.raw(CapitalizaName)}OldNameTranslations AS (
                SELECT
                    cot.${Prisma.raw(`${name}_id`)},
                    JSON_AGG(
                        JSONB_BUILD_OBJECT(
                            'languageCode', cot.language_code,
                            'name', cot.name
                        )
                    )::JSONB AS OldNameTranslations  
                FROM ${Prisma.raw(name + '_old_name_translations')} cot
                WHERE (${data.allLang} = TRUE OR 
                    ${data.langCode ? Prisma.sql`cot.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
                GROUP BY cot.${Prisma.raw(`${name}_id`)}
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
                WHERE (${data.allLang} = TRUE OR 
                    ${data.langCode ? Prisma.sql`cyt.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
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
                WHERE (${data.allLang} = TRUE OR 
                    ${data.langCode ? Prisma.sql`rt.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
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
                WHERE (${data.allLang} = TRUE OR 
                    ${data.langCode ? Prisma.sql`dt.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
                GROUP BY dt.district_id
            ),
            DistrictNewNameTranslations AS (
                SELECT
                    dt.district_id,
                    JSON_AGG(
                        JSONB_BUILD_OBJECT(
                            'languageCode', dt.language_code,
                            'name', dt.name
                        )
                    )::JSONB AS Translations
                FROM district_new_name_translations dt
                WHERE (${data.allLang} = TRUE OR 
                    ${data.langCode ? Prisma.sql`dt.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
                GROUP BY dt.district_id
            ),
            DistrictOldNameTranslations AS (
                SELECT
                    dt.district_id,
                    JSON_AGG(
                        JSONB_BUILD_OBJECT(
                            'languageCode', dt.language_code,
                            'name', dt.name
                        )
                    )::JSONB AS Translations
                FROM district_old_name_translations dt
                WHERE (${data.allLang} = TRUE OR 
                    ${data.langCode ? Prisma.sql`dt.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
                GROUP BY dt.district_id
            )
        SELECT
            c.*,
            (SELECT Translations FROM ${Prisma.raw(CapitalizaName)}Translations WHERE ${Prisma.raw(`${name}_id`)} = c.id) AS "${Prisma.raw(CapitalizaName)}Translations",
            (SELECT NewNameTranslations FROM ${Prisma.raw(CapitalizaName)}NewNameTranslations WHERE ${Prisma.raw(`${name}_id`)} = c.id) AS "${Prisma.raw(CapitalizaName)}NewNameTranslations",
            (SELECT OldNameTranslations FROM ${Prisma.raw(CapitalizaName)}OldNameTranslations WHERE ${Prisma.raw(`${name}_id`)} = c.id) AS "${Prisma.raw(CapitalizaName)}OldNameTranslations",
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
            JSONB_SET(
                JSONB_SET(
                    JSONB_SET(
                        ROW_TO_JSON(district)::JSONB,
                        '{DistrictTranslations}',
                        COALESCE(
                            (SELECT Translations FROM DistrictTranslations WHERE district_id = district.id),
                            '[]'::JSONB
                        )
                    ),
                    '{DistrictNewNameTranslations}',
                    COALESCE(
                        (SELECT Translations FROM DistrictNewNameTranslations WHERE district_id = district.id),
                        '[]'::JSONB
                    )
                ),
                '{DistrictOldNameTranslations}',
                COALESCE(
                    (SELECT Translations FROM DistrictOldNameTranslations WHERE district_id = district.id),
                    '[]'::JSONB
                )
            ) AS District

        FROM
            ${Prisma.raw(name)} c
        LEFT JOIN city ON c.city_id = city.id
        LEFT JOIN region ON city.region_id = region.id
        LEFT JOIN district ON c.district_id = district.id
        ${whereClause}
        GROUP BY 
            c.id, city.id, region.id, district.id
        ${
          data?.order === 'name'
            ? Prisma.raw(`ORDER BY
            (
                SELECT jsonb_extract_path_text(
                    Translations::jsonb->0, 'name'
                )
                FROM ${CapitalizaName}Translations
                WHERE ${`${name}_id`} = c.id
            ) ASC`)
            : Prisma.raw(`
                ORDER BY 
                c.order_number ASC,
                (
                    SELECT jsonb_extract_path_text(
                        Translations::jsonb->0, 'name'
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
