import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export async function getCityData(
  CapitalizaName: string,
  name: string,
  prisma: PrismaService,
  data: any,
  conditions?: Prisma.Sql[],
  pagination?: { take: number; skip: number }
) {
  const whereClause =
    conditions && conditions.length > 0
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
                  FROM ${Prisma.raw(name + (name === 'phone_types' ? '_id_translations' : '_translations'))} ct
                   GROUP BY ct.${Prisma.raw(`${name}_id`)}
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
              )
          SELECT
              c.*,  
              (SELECT Translations FROM ${Prisma.raw(CapitalizaName)}Translations WHERE ${Prisma.raw(`${name}_id`)} = c.id) AS "${Prisma.raw(CapitalizaName)}Translations",
              JSONB_SET(
                  COALESCE(ROW_TO_JSON(region)::JSONB, '{}'::JSONB),  
                  '{RegionTranslations}', 
                  COALESCE(
                      (SELECT Translations FROM RegionTranslations WHERE region_id = region.id), 
                      '[]'::JSONB
                  )
              ) AS "Region"
          FROM
              ${Prisma.raw(name)} c
          LEFT JOIN region ON c.region_id = region.id
          ${whereClause}
          GROUP BY 
              c.id, region.id
          ORDER BY
              (
                  SELECT jsonb_extract_path_text(
                      jsonb_path_query_first(
                          Translations, 
                          '$[*] ? (@.languageCode == $langCode)',
                          jsonb_build_object('langCode', ${Prisma.raw(`'${data.langCode ? data.langCode : 'ru'}'`)})
                      )::jsonb, 'name'
                  )
                  FROM ${Prisma.raw(CapitalizaName)}Translations
                  WHERE ${Prisma.raw(`${name}_id`)} = c.id
              ) ASC
          ${pagination ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}` : Prisma.empty}
      `
  );
  return result;
}
