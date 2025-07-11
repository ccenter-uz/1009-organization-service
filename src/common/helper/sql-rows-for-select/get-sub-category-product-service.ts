import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export async function getProductServiceSubCategoryOrderedData(
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
  ),
  OrganizationCounts AS (
    SELECT 
      ps.${Prisma.raw(`${name}_id`)} AS id, 
      COUNT(DISTINCT ps.organization_id)::int AS organization_count
    FROM product_services ps
    GROUP BY ps.${Prisma.raw(`${name}_id`)}
  )

SELECT
 --c.*,
     c.id AS "id",
     c.staff_number AS "staffNumber",
     c.order_number AS "orderNumber",
     c.status AS "status",
     c.product_service_category_id AS "productServiceCategoryId",
     c.edited_staff_number AS "editedStaffNumber",
     c.delete_reason AS "deleteReason",
     c.created_at AS "createdAt",
     c.updated_at AS "updatedAt",
     c.deleted_at AS "deletedAt",
    t.name AS name,
    JSONB_BUILD_OBJECT(
      'id', ${Prisma.raw(categoryName)}.id,
      'name', COALESCE(ct.name, '{}'::JSONB),
      'status', ${Prisma.raw(categoryName)}.status,
      'createdAt', ${Prisma.raw(categoryName)}.created_at,
      'updatedAt', ${Prisma.raw(categoryName)}.updated_at,
      'deletedAt', ${Prisma.raw(categoryName)}.deleted_at,
      'orderNumber', ${Prisma.raw(categoryName)}.order_number,
      'staffNumber', ${Prisma.raw(categoryName)}.staff_number,
      'deleteReason', ${Prisma.raw(categoryName)}.delete_reason,
      'editedStaffNumber', ${Prisma.raw(categoryName)}.edited_staff_number
    ) AS "ProductServiceCategory" , 
      COALESCE(oc.organization_count, 0) AS "orgCount"

FROM ${Prisma.raw(name)} c
LEFT JOIN ${Prisma.raw(categoryName)}  ON c.${Prisma.raw(`${categoryName}_id`)} = ${Prisma.raw(categoryName)}.id
LEFT JOIN ${Prisma.raw(CapitalizeName)}Translations t ON t.${Prisma.raw(`${name}_id`)} = c.id
LEFT JOIN ${Prisma.raw(CapitalizeCategoryName)}Translations ct ON ct.${Prisma.raw(`${categoryName}_id`)} = ${Prisma.raw(categoryName)}.id
LEFT JOIN OrganizationCounts oc ON oc.id = c.id
${whereClause}
GROUP BY 
  c.id, t.name, ${Prisma.raw(categoryName)}.id, ct.name, oc.organization_count
${
  data.order === 'name'
    ? Prisma.raw(`ORDER BY
        t.name ->> '${data.langCode ?? 'ru'}' ASC, c.order_number ASC`)
    : Prisma.raw(`
        ORDER BY 
        c.order_number ASC, 
        t.name ->> '${data.langCode ?? 'ru'}' ASC`)
}
${pagination ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}` : Prisma.empty}`
  );

  return result;
}
