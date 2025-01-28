import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export async function getSubCategoryOrderedData(
  CapitalizaName: string,
  name: string,
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
                            CategoryTranslations AS (
                                SELECT
                                    dt.category_id,
                                    JSON_AGG(
                                        JSONB_BUILD_OBJECT(
                                            'languageCode', dt.language_code,
                                            'name', dt.name
                                        )
                                    )::JSONB AS Translations
                                FROM category_translations dt
                                WHERE (${data.allLang} = TRUE OR 
                                    ${data.langCode ? Prisma.sql`dt.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
                                GROUP BY dt.category_id
                            )
                        SELECT
                            c.*,  
                            (SELECT Translations FROM ${Prisma.raw(CapitalizaName)}Translations WHERE ${Prisma.raw(`${name}_id`)} = c.id) AS "${Prisma.raw(CapitalizaName)}Translations", 
                            JSONB_SET(
                            ROW_TO_JSON(category)::JSONB,  
                            '{CategoryTranslations}', 
                            COALESCE(
                                (SELECT Translations FROM CategoryTranslations WHERE category_id = category.id), 
                                '[]'::JSONB
                            )
                        ) AS Category
                        FROM
                            ${Prisma.raw(name)} c
                        LEFT JOIN category ON c.category_id = category.id
                        ${whereClause}
                        GROUP BY 
                            c.id, category.id
                        ${
                          data.order === 'name'
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
