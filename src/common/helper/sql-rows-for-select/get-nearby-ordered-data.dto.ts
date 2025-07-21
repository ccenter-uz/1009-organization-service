import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export async function getNearbyOrderedData(
  CapitalizaName: string,
  name: string,
  prisma: PrismaService,
  data: any,
  pagination?: { take: number; skip: number }
) {
  const conditions: Prisma.Sql[] = [];

  if (data.status === 0 || data.status === 1)
    conditions.push(Prisma.sql`c.status = ${data.status}`);
  if (data.search) {
    conditions.push(Prisma.sql`
      EXISTS (
        SELECT 1
        FROM ${Prisma.raw(name + '_translations')} ct
        WHERE ct.${Prisma.raw(`${name}_id`)} = c.id
          AND ct.name ILIKE ${`%${data.search}%`}
        ORDER BY ct.language_code
        LIMIT 1
      )
    `);
  }
  if (data.nearbyCategoryId)
    conditions.push(
      Prisma.sql`c.nearby_category_id = ${data.nearbyCategoryId}`
    );
  if (data.cityId) conditions.push(Prisma.sql`c.city_id = ${data.cityId}`);
  if (data.regionId)
    conditions.push(Prisma.sql`c.region_id = ${data.regionId}`);
  if (data.districtId)
    conditions.push(Prisma.sql`c.district_id = ${data.districtId}`);

  const whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

    const result: any = await prisma.$queryRaw(
      Prisma.sql`
    WITH
      NearbyTranslations AS (
        SELECT
          ct.${Prisma.raw(`${name}_id`)},
          jsonb_object_agg(ct.language_code, ct.name) AS name
        FROM ${Prisma.raw(name + '_translations')} ct
        GROUP BY ct.${Prisma.raw(`${name}_id`)}
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
      --c.*,
      c.id AS "id",
      c.staff_number AS "staffNumber",
      c.order_number AS "orderNumber",
      c.status AS "status",
      c.nearby_category_id AS "nearbyCategoryId",
      c.city_id AS "cityId",
      c.region_id AS "regionId", 
      c.district_id AS "districtId",
      c.edited_staff_number AS "editedStaffNumber",
      --c.delete_reason AS "deleteReason",
      c.created_at AS "createdAt",
      c.updated_at AS "updatedAt",
      c.deleted_at AS "deletedAt",

      -- Translations
      nt.name AS name,

      -- City object
      JSONB_BUILD_OBJECT(
        'id', city.id,
        'name', COALESCE(cyt.name, '{}'::JSONB),
        'regionId', city.region_id,
        'status', city.status,
        'createdAt', city.created_at,
        'updatedAt', city.updated_at,
        'deletedAt', city.deleted_at
      ) AS city,

      -- Region object
      JSONB_BUILD_OBJECT(
        'id', region.id,
        'name', COALESCE(rt.name, '{}'::JSONB),
        'status', region.status,
        'createdAt', region.created_at,
        'updatedAt', region.updated_at,
        'deletedAt', region.deleted_at
      ) AS region,

      -- Nearby Category
      JSONB_BUILD_OBJECT(
        'id', nearby_category.id,
        'name', nearby_category.name,
        'status', nearby_category.status,
        'createdAt', nearby_category.created_at,
        'updatedAt', nearby_category.updated_at,
        'deletedAt', nearby_category.deleted_at,
        'orderNumber', nearby_category.order_number,
        'staffNumber', nearby_category.staff_number,
        'editedStaffNumber', nearby_category.edited_staff_number
      ) AS category,

      -- District object
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
        'deletedAt', district.deleted_at
      )
      END AS district

    FROM ${Prisma.raw(name)} c
    LEFT JOIN NearbyTranslations nt ON nt.${Prisma.raw(`${name}_id`)} = c.id
    LEFT JOIN city ON c.city_id = city.id
    LEFT JOIN CityTranslations cyt ON cyt.city_id = city.id
    LEFT JOIN region ON c.region_id = region.id
    LEFT JOIN RegionTranslations rt ON rt.region_id = region.id
    LEFT JOIN district ON c.district_id = district.id
    LEFT JOIN DistrictTranslations dt ON dt.district_id = district.id
    LEFT JOIN DistrictNewNameTranslations dnnt ON dnnt.district_id = district.id
    LEFT JOIN DistrictOldNameTranslations dont ON dont.district_id = district.id
    LEFT JOIN nearby_category ON c.nearby_category_id = nearby_category.id
    ${whereClause}
    ORDER BY ${
      data.order === 'orderNumber'
        ? Prisma.sql`
          c.order_number ASC NULLS LAST,
          nt.name ->> ${data.langCode} ASC
        `
        : Prisma.sql`
          nt.name ->> ${data.langCode} ASC
        `
    }
    ${pagination ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}` : Prisma.empty}
  `
    );

    return result;

}
