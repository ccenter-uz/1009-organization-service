import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export async function getSubCategoryOrderedData(
  CapitalizeName: string,
  name: string,
  CapitalizeCategoryName: string,
  categoryName: string,
  prisma: PrismaService,
  data: any,
  conditions?: Prisma.Sql[],
  pagination?: { take: number; skip: number }
) {
  const whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  const result: any = await prisma.$queryRaw(
    Prisma.sql`
        WITH
            ${Prisma.raw(CapitalizeName)}Translations AS (
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
            ${Prisma.raw(CapitalizeCategoryName)}Translations AS (
                SELECT
                    dt.${Prisma.raw(categoryName)}_id,
                    JSON_AGG(
                        JSONB_BUILD_OBJECT(
                            'languageCode', dt.language_code,
                            'name', dt.name
                        )
                    )::JSONB AS Translations
                FROM ${Prisma.raw(categoryName)}_translations dt
                GROUP BY dt.${Prisma.raw(categoryName)}_id
            )
        SELECT
            c.*,  
            (SELECT Translations FROM ${Prisma.raw(CapitalizeName)}Translations WHERE ${Prisma.raw(`${name}_id`)} = c.id) AS "${Prisma.raw(CapitalizeName)}Translations", 
            JSONB_SET(
            ROW_TO_JSON(${Prisma.raw(categoryName)})::JSONB,  
            ${Prisma.raw("'{" + CapitalizeCategoryName + "Translations}'")}, 
            COALESCE(
                (SELECT Translations FROM ${Prisma.raw(CapitalizeCategoryName)}Translations WHERE ${Prisma.raw(categoryName)}_id = ${Prisma.raw(categoryName)}.id), 
                '[]'::JSONB
            )
        ) AS ${Prisma.sql`"${Prisma.raw(CapitalizeCategoryName)}"`}
        FROM
            ${Prisma.raw(name)} c
        LEFT JOIN ${Prisma.raw(categoryName)} ON c.${Prisma.raw(categoryName)}_id = ${Prisma.raw(categoryName)}.id
        ${whereClause}
        GROUP BY 
            c.id, ${Prisma.raw(categoryName)}.id
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
                FROM ${CapitalizeName}Translations
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
                    FROM ${CapitalizeName}Translations
                    WHERE ${name}_id = c.id
                ) ASC
            `)
        }
        ${pagination ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}` : Prisma.empty}
    `
  );
  return result;
}
