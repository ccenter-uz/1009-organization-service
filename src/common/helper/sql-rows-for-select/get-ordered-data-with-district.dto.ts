import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export async function getOrderedDataWithDistrict(
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

  if (data.cityId) {
    conditions.push(Prisma.sql`c.city_id = ${data.cityId}`);
  }

  if (data.regionId) {
    conditions.push(Prisma.sql`c.region_id = ${data.regionId}`);
  }

  if (data.districtId) {
    conditions.push(Prisma.sql`c.district_id = ${data.districtId}`);
  }

  if (data.search) {
    const search = `%${data.search}%`;
    conditions.push(Prisma.sql`
      (
        EXISTS (
          SELECT 1 FROM ${Prisma.raw(name)}_translations ct
          WHERE ct.${Prisma.raw(name)}_id = c.id
          AND ct.name ILIKE ${search}
        )
        OR EXISTS (
          SELECT 1 FROM ${Prisma.raw(name)}_old_name_translations cot
          WHERE cot.${Prisma.raw(name)}_id = c.id
          AND cot.name ILIKE ${search}
        )
        OR EXISTS (
          SELECT 1 FROM ${Prisma.raw(name)}_new_name_translations cnt
          WHERE cnt.${Prisma.raw(name)}_id = c.id
          AND cnt.name ILIKE ${search}
        )
      )
    `);
  }

  const whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  const limitOffset = pagination
    ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}`
    : Prisma.empty;
  try {
    let result: any = await prisma.$queryRaw(Prisma.sql`
    WITH
      ${Prisma.raw(CapitalizaName)}Translations AS (
        SELECT ct.${Prisma.raw(`${name}_id`)}, jsonb_object_agg(ct.language_code, ct.name) AS name
        FROM ${Prisma.raw(name + '_translations')} ct
        GROUP BY ct.${Prisma.raw(`${name}_id`)}
      ),
      ${Prisma.raw(CapitalizaName)}NewNameTranslations AS (
        SELECT cnt.${Prisma.raw(`${name}_id`)}, jsonb_object_agg(cnt.language_code, cnt.name) AS name
        FROM ${Prisma.raw(name + '_new_name_translations')} cnt
        GROUP BY cnt.${Prisma.raw(`${name}_id`)}
      ),
      ${Prisma.raw(CapitalizaName)}OldNameTranslations AS (
        SELECT cot.${Prisma.raw(`${name}_id`)}, jsonb_object_agg(cot.language_code, cot.name) AS name
        FROM ${Prisma.raw(name + '_old_name_translations')} cot
        GROUP BY cot.${Prisma.raw(`${name}_id`)}
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
      cnt.name AS "newName",
      cot.name AS "oldName",
      JSONB_BUILD_OBJECT(
        'id', city.id,
        'name', COALESCE(cyt.name, '{}'::JSONB),
        'regionId', city.region_id,
        'status', city.status,
        'createdAt', city.created_at,
        'updatedAt', city.updated_at,
        'deletedAt', city.deleted_at
      ) AS city,
      JSONB_BUILD_OBJECT(
        'id', region.id,
        'name', COALESCE(rt.name, '{}'::JSONB),
        'regionId', city.region_id,
        'status', city.status,
        'createdAt', city.created_at,
        'updatedAt', city.updated_at,
        'deletedAt', city.deleted_at
      ) AS region,
CASE 
  WHEN c.district_id IS NULL THEN NULL
  ELSE JSONB_BUILD_OBJECT(
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
    LEFT JOIN ${Prisma.raw(CapitalizaName)}Translations ct ON ct.${Prisma.raw(`${name}_id`)} = c.id
    LEFT JOIN ${Prisma.raw(CapitalizaName)}NewNameTranslations cnt ON cnt.${Prisma.raw(`${name}_id`)} = c.id
    LEFT JOIN ${Prisma.raw(CapitalizaName)}OldNameTranslations cot ON cot.${Prisma.raw(`${name}_id`)} = c.id
    LEFT JOIN city ON c.city_id = city.id
    LEFT JOIN CityTranslations cyt ON cyt.city_id = city.id
    LEFT JOIN region ON c.region_id = region.id
    LEFT JOIN RegionTranslations rt ON rt.region_id = region.id
    LEFT JOIN district ON c.district_id = district.id
    LEFT JOIN DistrictTranslations dt ON dt.district_id = district.id
    LEFT JOIN DistrictNewNameTranslations dnnt ON dnnt.district_id = district.id
    LEFT JOIN DistrictOldNameTranslations dont ON dont.district_id = district.id
    ${whereClause}
    ORDER BY ${
      data.order === 'orderNumber'
        ? Prisma.sql`
        c.order_number ASC NULLS LAST,
        (SELECT name ->> ${data.langCode} FROM ${Prisma.raw(CapitalizaName)}Translations WHERE ${Prisma.raw(`${name}_id`)} = c.id) ASC
      `
        : Prisma.sql`
        (SELECT name ->> ${data.langCode} FROM ${Prisma.raw(CapitalizaName)}Translations WHERE ${Prisma.raw(`${name}_id`)} = c.id) ASC
      `
    }
    ${limitOffset}
  `);

    return result;
  } catch (error) {
    console.log(error);
  }
}
