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
        c.*,

        -- SubCategory name (multilingual)
        t.name AS name,

        -- Related Category with multilingual name
        JSONB_BUILD_OBJECT(
          'id', cat.id,
          'name', COALESCE(ct.name, '{}'::JSONB),
          'order_number', cat.order_number,
          'region_id', cat.region_id,
          'city_id', cat.city_id,
          'district_id', cat.district_id,
          'status', cat.status,
          'staff_number', cat.staff_number,
          'delete_reason', cat.delete_reason,
          'edited_staff_number', cat.edited_staff_number,
          'created_at', cat.created_at,
          'updated_at', cat.updated_at,
          'deleted_at', cat.deleted_at
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