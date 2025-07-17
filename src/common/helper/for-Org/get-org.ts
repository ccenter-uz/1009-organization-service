import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreatedByEnum,
  ModuleNamesObjectAdressArray,
  Roles,
} from 'types/global';
import { OrganizationFilterDto } from 'types/organization/organization/dto/filter-organization.dto';
import { createPagination } from '../pagination.helper';

export async function getOrgOptimizedQuery(
  prisma: PrismaService,
  data: OrganizationFilterDto,
  page: number,
  limit: number
) {
  const conditions: Prisma.Sql[] = [];
  let whereClause = Prisma.empty;

  if (data.search) {
    const queryName = data.search.replace('-', ' ').toLowerCase();

    const orConditions = [
      Prisma.sql`o.name ILIKE ${`%${data.search}%`}`,
      Prisma.sql`o.legal_name ILIKE ${`%${data.search}%`}`,
      Prisma.sql`o.inn ILIKE ${`%${data.search}%`}`,
      Prisma.sql`
      EXISTS (
        SELECT 1
        FROM product_service_category psc
        LEFT JOIN product_service_category_translations psct 
          ON psc.id = psct.product_service_category_id
        LEFT JOIN product_services ps 
          ON ps.product_service_category_id = psc.id
        WHERE COALESCE(psct.search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${queryName})
        AND ps.organization_id = o.id
      )`,
      Prisma.sql`
      EXISTS (
        SELECT 1
        FROM product_service_sub_category pssc
        LEFT JOIN product_service_sub_category_translations pssct 
          ON pssc.id = pssct.product_service_sub_category_id
        LEFT JOIN product_services ps 
          ON ps.product_service_sub_category_id = pssc.id
        WHERE COALESCE(pssct.search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${queryName})
        AND ps.organization_id = o.id
      )`,
    ];

    // OR bilan bitta guruhga qo‘shamiz
    conditions.push(Prisma.sql`(${Prisma.join(orConditions, ' OR ')})`);
  }

  if (data.address) {
    const query = data.address.replace('-', ' ').toLowerCase();

    conditions.push(
      Prisma.sql`
      (
        COALESCE(o.address_search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${query})
        OR EXISTS (
          SELECT 1 FROM district_translations dt
          WHERE dt.district_id = o.district_id
          AND dt.search_vector @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM region_translations rt
          WHERE rt.region_id = o.region_id
          AND rt.search_vector @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM passage_translations pt
          WHERE pt.passage_id = o.passage_id
          AND pt.search_vector @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM street_translations st
          WHERE st.street_id = o.street_id
          AND st.search_vector @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM area_translations at
          WHERE at.area_id = o.area_id
          AND at.search_vector @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM avenue_translations avtt
          WHERE avtt.avenue_id = o.avenue_id
          AND avtt.search_vector @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM city_translations ct
          WHERE ct.city_id = o.city_id
          AND ct.search_vector @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM residential_area_translations rat
          WHERE rat.residential_area_id = o.residential_id
          AND rat.search_vector @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM neighborhood_translations nt
          WHERE nt.neighborhood_id = o.neighborhood_id
          AND nt.search_vector @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM impasse_translations it
          WHERE it.impasse_id = o.impasse_id
          AND it.search_vector @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM village_translations vt
          WHERE vt.village_id = o.village_id
          AND vt.search_vector @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM lane_translations lt
          WHERE lt.lane_id = o.lane_id
          AND lt.search_vector @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM nearbees no
          JOIN nearby_translations nt ON nt.nearby_id = no.nearby_id
          WHERE no.organization_version_id = o.id
          AND (
            nt.search_vector @@ plainto_tsquery('simple', ${query})
            OR no.description_search_vector @@ plainto_tsquery('simple', ${query})
          )
        )
      )
    `
    );
  }

  if (data.subCategoryId) {
    conditions.push(Prisma.sql`o.sub_category_id = ${data.subCategoryId}`);
  }

  if (data.name) {
    conditions.push(Prisma.sql`o.name ILIKE ${`%${data.name}%`}`);
  }

  if (data.categoryTuId) {
    conditions.push(
      Prisma.sql`ps.product_service_category_id = ${data.categoryTuId}`
    );
  }

  // if (data.subCategoryId) {
  //   conditions.push(Prisma.sql`o.sub_category_id = ${data.subCategoryId}`);
  // }

  if (data.phoneType) {
    conditions.push(Prisma.sql`
      EXISTS (
        SELECT 1
        FROM phone p
        WHERE p.organization_id = o.id
        AND p.phone_type_id = ${data.phoneType}
      )
    `);
  }

  if (data.mainOrg) {
    conditions.push(Prisma.sql`o.main_organization_id = ${data.mainOrg}`);
  }

  if (data.regionId) {
    conditions.push(Prisma.sql`o.region_id = ${data.regionId}`);
  }

  if (data.cityId) {
    conditions.push(Prisma.sql`o.city_id = ${data.cityId}`);
  }

  if (data.districtId) {
    conditions.push(Prisma.sql`o.district_id = ${data.districtId}`);
  }

  if (data.villageId) {
    conditions.push(Prisma.sql`o.village_id = ${data.villageId}`);
  }

  if (data.nearbyId) {
    conditions.push(Prisma.sql`nb."nearby_id" = ${data.nearbyId}`);
  }

  if (data.phone) {
    conditions.push(Prisma.sql`
      EXISTS (
        SELECT 1
        FROM phone p
        WHERE p.organization_id = o.id
        AND p.phone ILIKE ${`%${data.phone}%`}
      )
    `);
  }

  if (data.kvartal) {
    conditions.push(Prisma.sql`o.kvartal ILIKE ${`%${data.kvartal}%`}`);
  }

  if (data.home) {
    conditions.push(Prisma.sql`o.home ILIKE ${`%${data.home}%`}`);
  }

  if (data.apartment) {
    conditions.push(Prisma.sql`o.apartment ILIKE ${`%${data.apartment}%`}`);
  }

  // if (data.isSaved) {
  //   console.log(data.userId);

  //   conditions.push(Prisma.sql`so."user_id" = ${data.userId}`);
  // }

  if (data.status === 0 || data.status === 1 || data.status === -1) {
    conditions.push(Prisma.sql`o.status = ${data.status}`);
  }

  if (data.belongAbonent === true) {
    conditions.push(Prisma.sql`o.created_by = ${CreatedByEnum.Client}`);
  }

  if (data.bounded === true) {
    conditions.push(Prisma.sql`o.created_by = ${CreatedByEnum.Billing}`);
  }

  if (data.fromOperator === true) {
    conditions.push(Prisma.sql`o.created_by = ${CreatedByEnum.Operator}`);
  }

  if (data.mine === true) {
    conditions.push(Prisma.sql`o.staff_number = ${data.staffNumber}`);
  }

  for (let i = 0; i < ModuleNamesObjectAdressArray.length; i++) {
    const moduleName = ModuleNamesObjectAdressArray[i];

    if (moduleName === data.module) {
      const columnName = `${moduleName}_id`;

      conditions.push(
        Prisma.sql`${Prisma.raw(`o.${columnName}`)} = ${data.objectAdressId}`
      );
    }
  }

  whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  // Step 2: Count query
  const totalResult = await prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
    SELECT COUNT(DISTINCT o.id) AS count
    FROM organization o
    LEFT JOIN phone p ON o.id = p.organization_id
    LEFT JOIN payment_types pt ON o.id = pt.organization_id
    LEFT JOIN main_organization mo ON o.main_organization_id = mo.id
    LEFT JOIN saved_organization so ON o.id = so.organization_id
    ${whereClause};
  `);

  const count = Number(totalResult[0]?.count || 0);

  const pagination = createPagination({
    count,
    page: page,
    perPage: limit,
  });
  const limitOffset = pagination
    ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}`
    : Prisma.empty;

  const result = await prisma.$queryRaw(Prisma.sql`
    SELECT  
      o.id,
      o.name, 
      o.address, 
      o.status, 
      o.edited_staff_number AS "editedStaffNumber",

      CASE
        WHEN so.is_saved = TRUE 
        THEN TRUE
        ELSE FALSE
      END AS "isSaved",

      CASE
        WHEN o.staff_number = ${data?.staffNumber} AND ${data?.role} = ${CreatedByEnum.Operator}
        THEN TRUE
        ELSE FALSE
      END AS "operFrom",

      o.created_at AS "createdAt",
      o.updated_at AS "updatedAt",
      o.deleted_at AS "deletedAt"
    FROM organization o
    LEFT JOIN saved_organization so ON o.id = so.organization_id
    ${whereClause}
    GROUP BY o.id, so.is_saved, so.deleted_at
    ${limitOffset};
  `);
  return {
    data: result,
    totalPage: pagination.totalPage,
    totalDocs: count > 0 ? count : 0,
  };
}
