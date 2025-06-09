import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export async function getOrderedData(
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
        FROM ${Prisma.raw(name + '_translations')} ct
        WHERE ct.${Prisma.raw(`${name}_id`)} = c.id
          AND ct.name ILIKE ${`%${data.search}%`}
      )
    `);
  }

  const whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  const result = await prisma.$queryRaw(
    Prisma.sql`
      WITH
        ${Prisma.raw(CapitalizaName)}Translations AS (
          SELECT ct.${Prisma.raw(`${name}_id`)}, jsonb_object_agg(ct.language_code, ct.name) AS name
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
        c.*,
        ct.name AS name,

        JSONB_BUILD_OBJECT(
          'id', city.id,
          'name', COALESCE(city_t.name, '{}'::JSONB),
          'regionId', city.region_id,
          'status', city.status,
          'createdAt', city.created_at,
          'updatedAt', city.updated_at,
          'deletedAt', city.deleted_at
        ) AS city,

        JSONB_BUILD_OBJECT(
          'id', region.id,
          'name', COALESCE(region_t.name, '{}'::JSONB),
          'regionId', city.region_id,
          'status', city.status,
          'createdAt', city.created_at,
          'updatedAt', city.updated_at,
          'deletedAt', city.deleted_at
        ) AS region,

        JSONB_BUILD_OBJECT(
          'id', district.id,
          'name', COALESCE(district_t.name, '{}'::JSONB),
          'newName', COALESCE(district_new_t.name, '{}'::JSONB),
          'oldName', COALESCE(district_old_t.name, '{}'::JSONB),
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
        ) AS district

      FROM ${Prisma.raw(name)} c
      LEFT JOIN ${Prisma.raw(CapitalizaName)}Translations ct ON ct.${Prisma.raw(`${name}_id`)} = c.id
      LEFT JOIN city ON city.id = c.city_id
      LEFT JOIN CityTranslations city_t ON city_t.city_id = city.id
      LEFT JOIN region ON region.id = c.region_id
      LEFT JOIN RegionTranslations region_t ON region_t.region_id = region.id
      LEFT JOIN district ON district.id = c.district_id
      LEFT JOIN DistrictTranslations district_t ON district_t.district_id = district.id
      LEFT JOIN DistrictNewNameTranslations district_new_t ON district_new_t.district_id = district.id
      LEFT JOIN DistrictOldNameTranslations district_old_t ON district_old_t.district_id = district.id

      ${whereClause}

      ORDER BY
        ${
          data.order === 'name'
            ? Prisma.sql`ct.name ->> ${data.langCode ?? 'ru'} ASC, c.order_number ASC`
            : Prisma.sql`c.order_number ASC, ct.name ->> ${data.langCode ?? 'ru'} ASC`
        }

      ${pagination ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}` : Prisma.empty}
    `
  );

  return result;
}

