import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { OrganizationFilterDto } from 'types/organization/organization/dto/filter-organization.dto';

export async function getOrgCount(
  data: OrganizationFilterDto,
  prisma: PrismaService,
  pagination?: { take: number; skip: number }
) {
  console.log(data, 'lllllll');

  const conditions: Prisma.Sql[] = [];
  const whereClause = Prisma.empty;
  if (data.status === 0 || data.status === 1 || data.status === -1)
    conditions.push(Prisma.sql`o.status = ${data.status}`);

  if (data.address) {
    const query = data.address.replace('-', ' ').toLowerCase();

    conditions.push(
      Prisma.sql`
      (
        COALESCE(o.address_search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${query})
        OR EXISTS (
          SELECT 1 FROM district_translations dt
          WHERE dt.district_id = o.district_id
          AND COALESCE(dt.search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM region_translations rt
          WHERE rt.region_id = o.region_id
          AND COALESCE(rt.search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM passage_translations pt
          JOIN passage p ON pt.passage_id = p.id
          WHERE p.id = o.passage_id
          AND COALESCE(pt.search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM street_translations st
          JOIN street s ON st.street_id = s.id
          WHERE s.id = o.street_id
          AND COALESCE(st.search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM area_translations at
          JOIN area a ON at.area_id = a.id
          WHERE a.id = o.area_id
          AND COALESCE(at.search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM avenue_translations avtt
          JOIN avenue av ON avtt.avenue_id = av.id
          WHERE av.id = o.avenue_id
          AND COALESCE(avtt.search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM city_translations ct
          JOIN city c ON ct.city_id = c.id
          WHERE c.id = o.city_id
          AND COALESCE(ct.search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM residential_area_translations rat
          JOIN residential_area ra ON rat.residential_area_id = ra.id
          WHERE ra.id = o.residential_id
          AND COALESCE(rat.search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM neighborhood_translations nt
          JOIN neighborhood n ON nt.neighborhood_id = n.id
          WHERE n.id = o.neighborhood_id
          AND COALESCE(nt.search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM impasse_translations it
          JOIN impasse i ON it.impasse_id = i.id
          WHERE i.id = o.impasse_id
          AND COALESCE(it.search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM village_translations vt
          JOIN village v ON vt.village_id = v.id
          WHERE v.id = o.village_id
          AND COALESCE(vt.search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM lane_translations lt
          JOIN lane l ON lt.lane_id = l.id
          WHERE l.id = o.lane_id
          AND COALESCE(lt.search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${query})
        )
        OR EXISTS (
          SELECT 1 FROM nearbees no
          JOIN nearby n ON no.nearby_id = n.id
          JOIN nearby_translations nt ON nt.nearby_id = n.id
          WHERE no.organization_version_id = o.id
          AND (
            COALESCE(nt.search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${query})
            OR COALESCE(no.description_search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${query})
          )
        )
      )
    `
    );
  }

  if (data.apartment) {
    conditions.push(Prisma.sql`o.apartment ILIKE ${`%${data.apartment}%`}`);
  }
  if (data.categoryId) {
    conditions.push(Prisma.sql`sub_category.category_id = ${data.categoryId}`);
  }
  if (data.categoryTuId) {
    conditions.push(
      Prisma.sql`ps.product_service_category_id = ${data.categoryTuId}`
    );
  }

  if (data.cityId) {
    conditions.push(Prisma.sql`o.city_id = ${data.cityId}`);
  }

  if (data.districtId) {
    conditions.push(Prisma.sql`o.district_id = ${data.districtId}`);
  }

  if (data.home) {
    conditions.push(Prisma.sql`o.home ILIKE ${`%${data.home}%`}`);
  }
  if (data.kvartal) {
    conditions.push(Prisma.sql`o.kvartal ILIKE ${`%${data.kvartal}%`}`);
  }

  if (data.mainOrg) {
    conditions.push(Prisma.sql`o.main_organization_id = ${data.mainOrg}`);
  }

if (data.name) {
  const queryName = data.name.replace('-', ' ').toLowerCase();

  const orConditions = [
    Prisma.sql`o.name ILIKE ${`%${data.name}%`}`,
    Prisma.sql`o.legal_name ILIKE ${`%${data.name}%`}`,
    Prisma.sql`o.inn ILIKE ${`%${data.name}%`}`,
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
  if (data.nearbyId) {
    conditions.push(Prisma.sql`nb."nearby_id" = ${data.nearbyId}`);
  }

  if (data.phone) {
    conditions.push(Prisma.sql`
      EXISTS (
        SELECT 1
        FROM phone p
        WHERE p.organization_id = o.id
        AND p.phone ILIKE ${`%${data.phone}%`}                                                                        )
    `);
  }

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

  if (data.regionId) {
    conditions.push(Prisma.sql`o.region_id = ${data.regionId}`);
  }

  if (data.subCategoryId) {
    conditions.push(Prisma.sql`o.sub_category_id = ${data.subCategoryId}`);
  } // qoldi

  if (data.subCategoryTuId) {
    conditions.push(
      Prisma.sql`ps.product_service_sub_category_id = ${data.subCategoryTuId}`
    );
  }

  if (data.villageId) {
    conditions.push(Prisma.sql`o.village_id = ${data.villageId}`);
  }
  if (data.streetId) {
    conditions.push(Prisma.sql`o.street_id = ${data.streetId}`);
  }

  if (data.module == 'street') {
    conditions.push(Prisma.sql`o.street_id = ${data.objectAdressId}`);
  }

  if (data.module == 'area') {
    conditions.push(Prisma.sql`o.area_id = ${data.objectAdressId}`);
  }

  if (data.module == 'lane') {
    conditions.push(Prisma.sql`o.lane_id = ${data.objectAdressId}`);
  }
  if (data.module == 'residential-area') {
    conditions.push(Prisma.sql`o.residential_id = ${data.objectAdressId}`);
  }

  if (data.module == 'neighborhood') {
    conditions.push(Prisma.sql`o.neighborhood_id = ${data.objectAdressId}`);
  }
  if (data.module == 'impasse') {
    conditions.push(Prisma.sql`o.impasse_id = ${data.objectAdressId}`);
  }

  if (data.module == 'avenue') {
    conditions.push(Prisma.sql`o.avenue_id = ${data.objectAdressId}`);
  }
  if (data.module == 'passage') {
    conditions.push(Prisma.sql`o.passage_id = ${data.objectAdressId}`);
  }

  if (data.belongAbonent === true) {
    conditions.push(Prisma.sql`o.created_by = 'Client'`);
  }
  if (data.bounded === true) {
    conditions.push(Prisma.sql`o.created_by = 'Billing'`);
  }
  if (data.mine === true) {
    conditions.push(Prisma.sql`o.staff_number = ${data.staffNumber}`);
  }

  const whereClauseFinal =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  const result = await prisma
    .$queryRaw(
      Prisma.sql`
 
    SELECT

   CAST(COUNT(*) OVER() AS INTEGER) AS "totalCount"
 
    FROM
      organization o
    LEFT JOIN city ON o.city_id = city.id
    LEFT JOIN region ON city.region_id = region.id
    LEFT JOIN district ON o.district_id = district.id
    LEFT JOIN village ON o.village_id = village.id
    LEFT JOIN residential_area ON o.residential_id = residential_area.id 
    LEFT JOIN neighborhood ON o.neighborhood_id = neighborhood.id
    LEFT JOIN street ON o.street_id = street.id
    LEFT JOIN area ON o.area_id = area.id  
    LEFT JOIN lane ON o.lane_id = lane.id
    LEFT JOIN impasse ON o.impasse_id = impasse.id
    LEFT JOIN segment ON o.segment_id = segment.id
    LEFT JOIN sub_category  ON o.sub_category_id = sub_category.id 
    LEFT JOIN category ON sub_category.category_id = category.id 
    LEFT JOIN main_organization  ON o.main_organization_id = main_organization.id 

LEFT JOIN LATERAL (
    SELECT * FROM product_services ps WHERE ps.organization_id = o.id LIMIT 1
) ps ON true
LEFT JOIN LATERAL (
    SELECT * FROM nearbees nb WHERE nb.organization_version_id = o.id LIMIT 1
) nb ON true
    ${whereClauseFinal}
    ORDER BY o.name ASC
    ${pagination ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}` : Prisma.empty}
  
    `
    )
    .catch((e) => {
      console.log(e, 'prisma Eror');
    });

  return result;
}
