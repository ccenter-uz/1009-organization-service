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
          FROM ${Prisma.raw(name + (name === 'phone_types' ? '_id_translations' : '_translations'))} ct
          GROUP BY ct.${Prisma.raw(`${name}_id`)}
        )
      SELECT
        c.id AS "id",
        c.staff_number AS "staffNumber",
        c.status AS "status",
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt",
        c.deleted_at AS "deletedAt",
        c.order_number AS "orderNumber",
        c.edited_staff_number AS "editedStaffNumber",
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
