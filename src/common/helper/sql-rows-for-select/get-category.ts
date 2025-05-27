import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export async function getCategoryData(
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
  if (data.districtId)
    conditions.push(Prisma.sql`c.district_id = ${data.districtId}`);
  if (data.search) {
    conditions.push(Prisma.sql`
              EXISTS (
                SELECT 1
                FROM category_translations ct
                WHERE ct.category_id = c.id
                  AND ct.name ILIKE ${`%${data.search}%`}
                ORDER BY ct.language_code   
                LIMIT 1
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
      -- CTE
      WITH
      CategoryTranslations AS (
        SELECT
          ct.category_id,
          jsonb_object_agg(ct.language_code, ct.name) AS name
        FROM category_translations ct
        GROUP BY ct.category_id
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
      ),
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
      )
      SELECT
        c.*,

        -- Category name as multilingual JSON
        ct.name AS name,

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
          'regionId', city.region_id,
          'status', city.status,
          'createdAt', city.created_at,
          'updatedAt', city.updated_at,
          'deletedAt', city.deleted_at
        ) AS region,

        -- District object with translation
        CASE 
  WHEN c.district_id IS NULL THEN NULL
      ELSE  JSONB_BUILD_OBJECT(
        'id', district.id,
        'name', COALESCE(dt.name, '{}'::JSONB),
        'newName', COALESCE(dnnt.name, '{}'::JSONB),
        'oldName', COALESCE(dont.name, '{}'::JSONB),
        'regionId', district.region_id,
        'cityId', district.city_id,
        'status', district.status,
        'index', district.index,
        'staffNumber', district.staff_number,
        'editedStaffNumber', district.edited_staff_number,
        'orderNumber', district.order_number,
        'createdAt', district.created_at,
        -- 'updatedAt', district.upd ated_at,
        'deletedAt', district.deleted_at
        ) END AS district
        FROM category c
        -- Joins
        LEFT JOIN CategoryTranslations ct ON ct.category_id = c.id
        LEFT JOIN city ON c.city_id = city.id
        LEFT JOIN CityTranslations cyt ON cyt.city_id = city.id
        LEFT JOIN region ON c.region_id = region.id
        LEFT JOIN RegionTranslations rt ON rt.region_id = region.id
        LEFT JOIN district ON c.district_id = district.id
        LEFT JOIN DistrictTranslations dt ON dt.district_id = district.id
        LEFT JOIN DistrictNewNameTranslations dnnt ON dnnt.district_id = district.id
        LEFT JOIN DistrictOldNameTranslations dont ON dont.district_id = district.id
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
