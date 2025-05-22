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
    conditions && conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  const result: any = await prisma.$queryRaw(
    Prisma.sql`
      WITH
  ${Prisma.raw(CapitalizaName)}Translations AS (
    SELECT
      ct.${Prisma.raw(`${name}_id`)} AS id,
      jsonb_object_agg(ct.language_code, ct.name) AS name
    FROM ${Prisma.raw(name + (name === 'phone_types' ? '_id_translations' : '_translations'))} ct
    GROUP BY ct.${Prisma.raw(`${name}_id`)}
  ),
  OrganizationCounts AS (
    SELECT 
      ps.product_service_category_id AS id, 
      COUNT(DISTINCT ps.organization_id)::int AS organization_count
    FROM product_services ps 
    GROUP BY ps.product_service_category_id
  )

SELECT
  c.*,
  t.name,
  COALESCE(oc.organization_count, 0) AS "orgCount"
FROM
  ${Prisma.raw(name)} c
LEFT JOIN ${Prisma.raw(CapitalizaName)}Translations t ON t.id = c.id
LEFT JOIN OrganizationCounts oc ON oc.id = c.id
${whereClause}
GROUP BY 
  c.id, t.name, oc.organization_count
${
  data.order === 'name'
    ? Prisma.raw(`ORDER BY
        t.name ->> '${data.langCode ?? 'ru'}' ASC,
        c.order_number ASC`)
    : Prisma.raw(`
        ORDER BY 
        c.order_number ASC,
        t.name ->> '${data.langCode ?? 'ru'}' ASC`)
}
${pagination ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}` : Prisma.empty}
`
  );
  return result;
}
