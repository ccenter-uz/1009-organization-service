import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export async function getOrderedData(
  CapitalizaName: string,
  name: string,
  prisma: PrismaService,
  data: any,
  pagination?: { take: number; skip: number }
) {
  try {
    console.log(data.cityId, 'CITY_ID');
    const conditions: Prisma.Sql[] = [];

    if (data.status === 0 || data.status === 1) {
      conditions.push(Prisma.sql`c.status = 168`);
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
      conditions.push(Prisma.sql`
    EXISTS (
      SELECT 1 
      FROM category_translations ct
      WHERE ct.category_id = c.id
      AND ct.name ILIKE ${`%${data.search}%`}
    )
  `);
    }

    // Check if conditions exist and properly join them
    const whereClause =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;

    // Log the query and check if it looks good
    console.log(whereClause, 'WHERE CLAUSE');

    const result: any = await prisma.$queryRaw(
      Prisma.sql`
        WITH category_data AS (
            SELECT 
                c.id,
                c.staff_number,
                c.status,
                c.region_id,
                c.city_id,
                c.district_id,
                c.order_number,
                c.created_at,
                c.updated_at,
                c.deleted_at,
                jsonb_object_agg(ct.language_code, ct.name) AS name
            FROM category c
            LEFT JOIN category_translations ct ON c.id = ct.category_id
            WHERE c.city_id = ${data.city_id}
            GROUP BY c.id
        ),
        region_data AS (
            SELECT 
                r.id AS region_id,
                jsonb_object_agg(rt.language_code, rt.name) AS name
            FROM region r
            LEFT JOIN region_translations rt ON r.id = rt.region_id
            GROUP BY r.id
        ),
        city_data AS (
            SELECT 
                city.id AS city_id,
                jsonb_object_agg(cityt.language_code, cityt.name) AS name
            FROM city
            LEFT JOIN city_translations cityt ON city.id = cityt.city_id
            GROUP BY city.id
        ),
        district_data AS (
            SELECT 
                d.id AS district_id,
                jsonb_object_agg(dt.language_code, dt.name) AS name
            FROM district d
            LEFT JOIN district_translations dt ON d.id = dt.district_id
            GROUP BY d.id
        )
        SELECT 
            c.*,
            r.name AS region,
            ci.name AS city,
            d.name AS district
        FROM category_data c
        LEFT JOIN region_data r ON c.region_id = r.region_id
        LEFT JOIN city_data ci ON c.city_id = ci.city_id
        LEFT JOIN district_data d ON c.district_id = d.district_id
        ORDER BY c.order_number ASC
        LIMIT ${pagination?.take ?? 10} OFFSET ${pagination?.skip ?? 0};
    `
    );
    console.log(result, 'RESULT');

    return result;
  } catch (error) {
    console.log(error, 'ERROR');
    throw error;
  }
}
