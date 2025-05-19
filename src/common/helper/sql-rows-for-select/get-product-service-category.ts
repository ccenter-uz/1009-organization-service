import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export async function getProductServiceCategoryData(
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
  try {
    const result: any = await prisma.$queryRaw(
      Prisma.sql`
        WITH
            ${Prisma.raw(CapitalizaName)}Translations AS (
                SELECT
                    ct.${Prisma.raw(`${name}_id`)},
            jsonb_object_agg(ct.language_code, ct.name) AS name
                FROM ${Prisma.raw(name + (name === 'phone_types' ? '_id_translations' : '_translations'))} ct
              GROUP BY ct.${Prisma.raw(`${name}_id`)}
            )
        SELECT
            c.*,  
            (SELECT name FROM ${Prisma.raw(CapitalizaName)}Translations 
            WHERE ${Prisma.raw(`${name}_id`)} = c.id) AS "name",
              (
    SELECT COUNT(DISTINCT o.id)
    FROM organization o
    JOIN product_services ps ON ps.organization_id = o.id
    WHERE ps.product_service_category_id = c.id
  ) AS "organization_count"
        FROM
            ${Prisma.raw(name)} c
        ${whereClause}
        GROUP BY 
            c.id
        ${
          data.order === 'name'
            ? Prisma.raw(`ORDER BY
              (
            SELECT name ->> '${data.langCode ?? 'ru'}'
            FROM ${CapitalizaName}Translations
            WHERE ${name}_id = c.id
        ) ASC, c.order_number ASC`)
            : Prisma.raw(`
                ORDER BY 
                c.order_number ASC, 
             (
            SELECT name ->> '${data.langCode ?? 'ru'}'
            FROM ${CapitalizaName}Translations
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
