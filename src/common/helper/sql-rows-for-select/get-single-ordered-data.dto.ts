import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export async function getSingleOrderedData(
  CapitalizaName: string,
  name: string,
  prisma: PrismaService,
  data: any,
  conditions: Prisma.Sql[] = [],
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
          FROM ${Prisma.raw(name + '_translations')} ct
          GROUP BY ct.${Prisma.raw(`${name}_id`)}
        )


      SELECT
        c.*,

        -- Translated name
        ct.name AS name


      FROM ${Prisma.raw(name)} c
      LEFT JOIN ${Prisma.raw(CapitalizaName)}Translations ct ON ct.${Prisma.raw(`${name}_id`)} = c.id

      ${whereClause}

      ORDER BY
        ${
          data.order === 'orderNumber'
            ? Prisma.sql`
                c.order_number ASC NULLS LAST,
                ct.name ->> ${data.langCode} ASC
              `
            : Prisma.sql`
                ct.name ->> ${data.langCode} ASC
              `
        }

      ${pagination ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}` : Prisma.empty}
    `
    );
    return result;
  } catch (error) {
    console.log(error);
  }
}
