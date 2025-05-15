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

  try {
    const result: any = await prisma.$queryRaw(
      Prisma.sql`WITH
    ${Prisma.raw(CapitalizeName)}Translations AS (
        SELECT
            ct.${Prisma.raw(`${name}_id`)},
            jsonb_object_agg(ct.language_code, ct.name) AS name 
        FROM ${Prisma.raw(name + '_translations')} ct
        GROUP BY ct.${Prisma.raw(`${name}_id`)}
    ),
    ${Prisma.raw(CapitalizeCategoryName)}Translations AS (
        SELECT
            dt.${Prisma.raw(`${categoryName}_id`)},
            jsonb_object_agg(dt.language_code, dt.name) AS name
        FROM ${Prisma.raw(`${categoryName}_translations`)} dt
        GROUP BY dt.${Prisma.raw(`${categoryName}_id`)}
    )

SELECT
    c.*,  
    (SELECT name FROM ${Prisma.raw(CapitalizeName)}Translations 
     WHERE ${Prisma.raw(`${name}_id`)} = c.id) AS "name", 
            
    JSONB_SET(
        ROW_TO_JSON(${Prisma.raw(categoryName)})::JSONB,  
        '{name}', 
        COALESCE(
            (
            SELECT name
            FROM ${Prisma.raw(CapitalizeCategoryName)}Translations 
             WHERE ${Prisma.raw(`${categoryName}_id`)} = ${Prisma.raw(categoryName)}.id), 
            '[]'::JSONB
        )
    ) AS ${Prisma.sql`"${Prisma.raw(CapitalizeCategoryName)}"`}

FROM
    ${Prisma.raw(name)} c
LEFT JOIN ${Prisma.raw(categoryName)} 
    ON c.${Prisma.raw(`${categoryName}_id`)} = ${Prisma.raw(categoryName)}.id
${whereClause}
GROUP BY 
    c.id, ${Prisma.raw(categoryName)}.id
${
  data.order === 'name'
    ? Prisma.raw(`ORDER BY
        (
            SELECT name ->> '${data.langCode ?? 'ru'}'
            FROM ${CapitalizeName}Translations
            WHERE ${name}_id = c.id
        ) ASC, c.order_number ASC`)
    : Prisma.raw(`
        ORDER BY 
        c.order_number ASC, 
        (
            SELECT name ->> '${data.langCode ?? 'ru'}'
            FROM ${CapitalizeName}Translations
            WHERE ${name}_id = c.id
        ) ASC
    `)
}
${pagination ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}` : Prisma.empty}
`
    );
    return result;
  } catch (error) {
    console.log(error);
  }
}
