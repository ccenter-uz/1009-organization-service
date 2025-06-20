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
    conditions && conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  const result: any = await prisma.$queryRaw(
    Prisma.sql`
      WITH
        ${Prisma.raw(CapitalizeName)}Translations AS (
          SELECT
            ct.${Prisma.raw(`${name}_id`)},
            jsonb_object_agg(ct.language_code, ct.name) AS name
          FROM ${Prisma.raw(name + '_translations')} ct
          GROUP BY ct.${Prisma.raw(`${name}_id`)}
        ),
        ${Prisma.raw(CapitalizeCategoryName)}Translations AS (
          SELECT
            ct.${Prisma.raw(`${categoryName}_id`)},
            jsonb_object_agg(ct.language_code, ct.name) AS name
          FROM ${Prisma.raw(categoryName + '_translations')} ct
          GROUP BY ct.${Prisma.raw(`${categoryName}_id`)}
        )

      SELECT
        c.id AS id,
       c.category_id AS "categoryId",
       c.staff_number AS "staffNumber",
       c.order_number AS "orderNumber",
       c.status AS "status",
       c.edited_staff_number AS "editedStaffNumber",
       c.delete_reason AS "deleteReason",
       c.created_at AS "createdAt",
       c.updated_at AS "updatedAt",
       c.deleted_at AS "deletedAt",

        -- SubCategory name (multilingual)
        t.name AS name,

        -- Related Category with multilingual name
        JSONB_BUILD_OBJECT(
          'id', cat.id,
          'name', COALESCE(ct.name, '{}'::JSONB),
          'orderNumber', cat.order_number,
          'regionId', cat.region_id,
          'cityId', cat.city_id,
          'districtId', cat.district_id,
          'status', cat.status,
          'staffNumber', cat.staff_number,
          'deleteReason', cat.delete_reason,
          'editedStaffNumber', cat.edited_staff_number,
          'createdAt', cat.created_at,
          'updatedAt', cat.updated_at,
          'deletedAt', cat.deleted_at
        ) AS ${Prisma.sql`"${Prisma.raw(CapitalizeCategoryName)}"`}

      FROM ${Prisma.raw(name)} c
      LEFT JOIN ${Prisma.raw(CapitalizeName)}Translations t ON t.${Prisma.raw(`${name}_id`)} = c.id
      LEFT JOIN ${Prisma.raw(categoryName)} cat ON c.${Prisma.raw(`${categoryName}_id`)} = cat.id
      LEFT JOIN ${Prisma.raw(CapitalizeCategoryName)}Translations ct ON ct.${Prisma.raw(`${categoryName}_id`)} = cat.id

      ${whereClause}

      ORDER BY
        ${
          data.order === 'orderNumber'
            ? Prisma.sql`
                c.order_number ASC NULLS LAST,
                t.name ->> ${data.langCode} ASC
              `
            : Prisma.sql`
                t.name ->> ${data.langCode} ASC
              `
        }

      ${pagination ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}` : Prisma.empty}
    `
  );

  return result;
}