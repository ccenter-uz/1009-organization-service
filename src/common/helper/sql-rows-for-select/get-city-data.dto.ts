import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export async function getCityData(
  CapitalizaName: string,
  name: string,
  prisma: PrismaService,
  data: any,
  pagination?: { take: number; skip: number }
) {
  const conditions: Prisma.Sql[] = [];

  if (data.status === 0 || data.status === 1) {
    conditions.push(Prisma.sql`c.status = ${data.status}`);
  }

  if (data.search) {
    conditions.push(Prisma.sql`
      EXISTS (
        SELECT 1
        FROM city_translations ct
        WHERE ct.city_id = c.id
          AND ct.name ILIKE ${`%${data.search}%`}
        LIMIT 1
      )
    `);
  }

  if (data.regionId) {
    conditions.push(Prisma.sql`c.region_id = ${data.regionId}`);
  }

  const whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  try {
    const result: any = await prisma.$queryRaw(
      Prisma.sql`
      WITH
        CityTranslations AS (
          SELECT
            ct.city_id,
            jsonb_object_agg(ct.language_code, ct.name) AS name
          FROM city_translations ct
          GROUP BY ct.city_id
        ),
        RegionTranslations AS (
          SELECT
            rt.region_id,
            jsonb_object_agg(rt.language_code, rt.name) AS name
          FROM region_translations rt
          GROUP BY rt.region_id
        )
      SELECT
        c.*,

        -- CityTranslations as multilingual JSON
        ct.name AS name,

        -- Region JSON obyekt
        JSONB_BUILD_OBJECT(
          'id', region.id,
          'name', COALESCE(rt.name, '{}'::JSONB),
          'status', region.status,
          'createdAt', region.created_at,
          'updatedAt', region.updated_at,
          'deletedAt', region.deleted_at
        ) AS region

      FROM city c
      LEFT JOIN region ON c.region_id = region.id
      LEFT JOIN RegionTranslations rt ON rt.region_id = region.id
      LEFT JOIN CityTranslations ct ON ct.city_id = c.id

      ${whereClause}
      ORDER BY
        ct.name ->> ${data.langCode} ASC
      ${pagination ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}` : Prisma.empty}
    `
    );

    return result;
  } catch (error) {
    console.error('Query error:', error);
    return [];
  }
}
