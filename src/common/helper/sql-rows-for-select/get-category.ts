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
        WITH
            ${Prisma.raw(CapitalizaName)}Translations AS (
                SELECT
                    ct.${Prisma.raw(`${name}_id`)},
                     jsonb_object_agg(ct.language_code, ct.name) AS name
                FROM ${Prisma.raw(name + '_translations')} ct
                GROUP BY ct.${Prisma.raw(`${name}_id`)}
            ),
            CityTranslations AS (
                SELECT
                    cyt.city_id,
                    jsonb_object_agg(cyt.language_code, cyt.name) AS name
                FROM city_translations cyt
                GROUP BY cyt.city_id
            ),

            RegionTranslations AS (
                SELECT
                    rt.region_id,
                  jsonb_object_agg(rt.language_code, rt.name) AS name
                FROM region_translations rt
                GROUP BY rt.region_id
            ),
            
            DistrictTranslations AS (
                SELECT
                    dt.district_id,
        jsonb_object_agg(dt.language_code, dt.name) AS name
                FROM district_translations dt
                GROUP BY dt.district_id
            ),
            DistrictNewNameTranslations AS (
                SELECT
                    dnnt.district_id,
                jsonb_object_agg(dnnt.language_code, dnnt.name) AS name
                FROM district_new_name_translations dnnt
                GROUP BY dnnt.district_id
            ),
            DistrictOldNameTranslations AS (
                SELECT
                    dont.district_id,
                jsonb_object_agg(dont.language_code, dont.name) AS name
                FROM district_old_name_translations dont
                GROUP BY dont.district_id
            )
        SELECT
            c.*,
      (SELECT name FROM ${Prisma.raw(CapitalizaName)}Translations WHERE ${Prisma.raw(`${name}_id`)} = c.id) AS "name",
                      
 CASE
        WHEN city.id IS NOT NULL THEN
      JSONB_BUILD_OBJECT(
        'id', city.id,
        'name', COALESCE(
            (SELECT name FROM CityTranslations WHERE city_id = city.id),
            '{}'::JSONB
        ),
        'regionId', city.region_id,
        'status', city.status,
        'createdAt', city.created_at,
        'updatedAt', city.updated_at,
        'deletedAt', city.deleted_at
    ) ELSE NULL
    END  AS "city",
            CASE
        WHEN region.id IS NOT NULL THEN
          JSONB_BUILD_OBJECT(
        'id', region.id,
        'name', COALESCE(
            (SELECT name FROM RegionTranslations WHERE region_id = region.id),
            '{}'::JSONB
        ),
        'status', region.status,
        'createdAt', region.created_at,
        'updatedAt', region.updated_at,
        'deletedAt', region.deleted_at
    ) ELSE NULL
    END  AS "region",
            
    CASE
        WHEN district.id IS NOT NULL THEN
        JSONB_BUILD_OBJECT(
        'id', district.id,
        'name', COALESCE(
            (SELECT name FROM DistrictTranslations WHERE district_id = district.id),
            '{}'::JSONB
        ),
                'oldName', COALESCE(
            (SELECT name FROM DistrictOldNameTranslations WHERE district_id = district.id),
            '{}'::JSONB
        ),
                'newName', COALESCE(
            (SELECT name FROM DistrictNewNameTranslations WHERE district_id = district.id),
            '{}'::JSONB
        ),
        'regionId', district.region_id,
        'cityId', district.city_id,
        'status', district.status,
        'index', district.index,
        'staffNumber', district.staff_number,
        'editedStaffNumber', district.edited_staff_number,
        'orderNumber', district.order_number,
        'createdAt', district.created_at,
       -- 'updatedAt', district.upda ted_at,
        'deletedAt', district.deleted_at
    )  ELSE NULL
    END  AS "district"

        FROM
            ${Prisma.raw(name)} c
        LEFT JOIN city ON c.city_id = city.id
        LEFT JOIN region ON c.region_id = region.id
        LEFT JOIN district ON c.district_id = district.id
        ${whereClause}
        GROUP BY 
            c.id, city.id, region.id, district.id
        ${
          data.order === 'name'
            ? Prisma.raw(`ORDER BY
          (
            SELECT name ->> '${data.langCode ?? 'ru'}'
            FROM ${CapitalizaName}Translations
            WHERE ${name}_id = c.id
        ) ASC`)
            : Prisma.raw(`
                ORDER BY 
                c.order_number ASC, 
           (
            SELECT name ->> '${data.langCode ?? 'ru'}'
            FROM ${CapitalizaName}Translations
            WHERE ${name}_id = c.id
        ) ASC
            `)
        }
        ${pagination ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}` : Prisma.empty}
    `
    );
    return result;
  } catch (error) {
    console.log(error);
  }
}
