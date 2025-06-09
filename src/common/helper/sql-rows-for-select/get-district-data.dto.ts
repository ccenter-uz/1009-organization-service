import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export async function getDistrictData(
  CapitalizaName: string,
  name: string,
  prisma: PrismaService,
  data: any,
  pagination?: { take: number; skip: number }
) {
  const conditions: Prisma.Sql[] = [];

  if (data.status === 0 || data.status === 1)
    conditions.push(Prisma.sql`c.status = ${data.status}`);
  if (data.cityId) conditions.push(Prisma.sql`c.city_id = ${data.cityId}`);
  if (data.regionId)
    conditions.push(Prisma.sql`c.region_id = ${data.regionId}`);

  if (data.search) {
    conditions.push(Prisma.sql`
      (
        EXISTS (
          SELECT 1 FROM district_translations dt
          WHERE dt.district_id = c.id AND dt.name ILIKE ${`%${data.search}%`}
          LIMIT 1
        )
        OR EXISTS (
          SELECT 1 FROM district_old_name_translations dont
          WHERE dont.district_id = c.id AND dont.name ILIKE ${`%${data.search}%`}
          LIMIT 1
        )
        OR EXISTS (
          SELECT 1 FROM district_new_name_translations dnnt
          WHERE dnnt.district_id = c.id AND dnnt.name ILIKE ${`%${data.search}%`}
          LIMIT 1
        )
      )
    `);
  }

  const whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  try {
    const result: any = await prisma.$queryRaw(
      Prisma.sql`
      -- CTEs
      WITH
      DistrictTranslations AS (
        SELECT district_id, jsonb_object_agg(language_code, name) AS name
        FROM district_translations
        GROUP BY district_id
      ),
      DistrictNewNameTranslations AS (
        SELECT district_id, jsonb_object_agg(language_code, name) AS name
        FROM district_new_name_translations
        GROUP BY district_id
      ),
      DistrictOldNameTranslations AS (
        SELECT district_id, jsonb_object_agg(language_code, name) AS name
        FROM district_old_name_translations
        GROUP BY district_id
      ),
      CityTranslations AS (
        SELECT city_id, jsonb_object_agg(language_code, name) AS name
        FROM city_translations
        GROUP BY city_id
      ),
      RegionTranslations AS (
        SELECT region_id, jsonb_object_agg(language_code, name) AS name
        FROM region_translations
        GROUP BY region_id
      )
      SELECT
        c.*,

        -- District name as multilingual JSON
        dt.name AS name,
        dnnt.name AS newName,
        dont.name AS oldName,

        -- City object with translation
        JSONB_BUILD_OBJECT(
          'id', city.id,
          'name', COALESCE(cyt.name, '{}'::JSONB),
          'regionId', city.region_id,
          'status', city.status,
          'createdAt', city.created_at,
          'updatedAt', city.updated_at,
          'deletedAt', city.deleted_at
        ) AS city,

        -- Region object with translation
        JSONB_BUILD_OBJECT(
          'id', region.id,
          'name', COALESCE(rt.name, '{}'::JSONB),
          'status', region.status,
          'createdAt', region.created_at,
          'updatedAt', region.updated_at,
          'deletedAt', region.deleted_at
        ) AS region

      FROM district c
      LEFT JOIN DistrictTranslations dt ON dt.district_id = c.id
      LEFT JOIN DistrictNewNameTranslations dnnt ON dnnt.district_id = c.id
      LEFT JOIN DistrictOldNameTranslations dont ON dont.district_id = c.id
      LEFT JOIN city ON c.city_id = city.id
      LEFT JOIN CityTranslations cyt ON cyt.city_id = city.id
      LEFT JOIN region ON c.region_id = region.id
      LEFT JOIN RegionTranslations rt ON rt.region_id = region.id

      ${whereClause}

      ORDER BY
        ${
          data.order === 'orderNumber'
            ? Prisma.sql`
                c.order_number ASC NULLS LAST,
                dt.name ->> ${data.langCode} ASC
              `
            : Prisma.sql`
                dt.name ->> ${data.langCode} ASC
              `
        }

      ${pagination ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}` : Prisma.empty}
    `
    );

    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch district data');
  }
}
