import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatedByEnum } from 'types/global';
import { OrganizationFilterDto } from 'types/organization/organization/dto/filter-organization.dto';

export async function getOrg(
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
    conditions.push(Prisma.sql`o.name ILIKE ${`%${data.name}%`}`);
    conditions.push(Prisma.sql`o.legal_name ILIKE ${`%${data.name}%`}`);
    conditions.push(Prisma.sql`o.inn ILIKE ${`%${data.name}%`}`);
    const queryName = data.name.replace('-', ' ').toLowerCase();
    conditions.push(
      Prisma.sql`
      EXISTS (
        SELECT 1
        FROM product_service_category psc
        LEFT JOIN product_service_category_translations psct 
          ON psc.id = psct.product_service_category_id
        LEFT JOIN product_service_sub_category pssc
          ON psc.id = pssc.product_service_category_id
        LEFT JOIN product_service_sub_category_translations pssct
          ON pssc.id = pssct.product_service_sub_category_id
        LEFT JOIN product_services ps
          ON ps.product_service_sub_category_id = pssc.id
        WHERE (COALESCE(psct.search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${queryName})
          OR COALESCE(pssct.search_vector, ''::tsvector) @@ plainto_tsquery('simple', ${queryName})
)
        AND ps.organization_id = o.id
      )`
    );
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
  }

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
    ),

    DistrictTranslations AS (
      SELECT
        dt.district_id,
        jsonb_object_agg(dt.language_code, dt.name) AS name
      FROM district_translations dt
      GROUP BY dt.district_id
    ),
    DistrictOldNameTranslations AS (
      SELECT
        dot.district_id,
        jsonb_object_agg(dot.language_code, dot.name) AS name
      FROM district_old_name_translations dot
      GROUP BY dot.district_id
    ),
    DistrictNewNameTranslations AS (
      SELECT
        dnt.district_id,
       jsonb_object_agg(dnt.language_code, dnt.name) AS name
      FROM district_new_name_translations dnt
      GROUP BY dnt.district_id
    ),
    
    -- **Village uchun yangi nomlar va eski nomlarni saqlovchi CTE qo‘shildi**
    VillageTranslations AS (
      SELECT
        vt.village_id,
        jsonb_object_agg(vt.language_code, vt.name) AS name
      FROM village_translations vt
      GROUP BY vt.village_id
    ),
    VillageOldNameTranslations AS (
      SELECT
        vot.village_id,
        jsonb_object_agg(vot.language_code, vot.name) AS name
      FROM village_old_name_translations vot
      GROUP BY vot.village_id
    ),
    VillageNewNameTranslations AS (
      SELECT
        vnt.village_id,
        jsonb_object_agg(vnt.language_code, vnt.name) AS name
      FROM village_new_name_translations vnt
      GROUP BY vnt.village_id
    ),



      ResidentialAreaTranslations AS (
        SELECT
            rat.residential_area_id,
        jsonb_object_agg(rat.language_code, rat.name) AS name
        FROM residential_area_translations rat
        GROUP BY rat.residential_area_id
    ),
    ResidentialAreaOldNameTranslations AS (
        SELECT
            raot.residential_area_id,
        jsonb_object_agg(raot.language_code, raot.name) AS name
        FROM residential_area_old_name_translations raot
        GROUP BY raot.residential_area_id
    ),
    ResidentialAreaNewNameTranslations AS (
        SELECT
        rant.residential_area_id,
        jsonb_object_agg(rant.language_code, rant.name) AS name
        FROM residential_area_new_name_translations rant
        GROUP BY rant.residential_area_id
    ),

   
NeighborhoodTranslations AS (
  SELECT
    nt.neighborhood_id,
        jsonb_object_agg(nt.language_code, nt.name) AS name
  FROM neighborhood_translations nt
  GROUP BY nt.neighborhood_id
),
NeighborhoodOldNameTranslations AS (
  SELECT
    nott.neighborhood_id,
      jsonb_object_agg(nott.language_code, nott.name) AS name
  FROM neighborhood_old_name_translations nott
  GROUP BY nott.neighborhood_id
),
NeighborhoodNewNameTranslations AS (
  SELECT
    nnt.neighborhood_id,
    jsonb_object_agg(nnt.language_code, nnt.name) AS name
  FROM neighborhood_new_name_translations nnt
  GROUP BY nnt.neighborhood_id
),

    AreaTranslations AS (
        SELECT
            at.area_id,
    jsonb_object_agg(at.language_code, at.name) AS name
        FROM area_translations at
        GROUP BY at.area_id
    ),
    AreaOldNameTranslations AS (
        SELECT
            aot.area_id,
          jsonb_object_agg(aot.language_code, aot.name) AS name
        FROM area_old_name_translations aot
        GROUP BY aot.area_id
    ),
    AreaNewNameTranslations AS (
        SELECT
            ant.area_id,
          jsonb_object_agg(ant.language_code, ant.name) AS name
        FROM area_new_name_translations ant
        GROUP BY ant.area_id
    ),

        StreetTranslations AS (
      SELECT
        st.street_id,
        jsonb_object_agg(st.language_code, st.name) AS name
      FROM street_translations st
      GROUP BY st.street_id
    ),
    StreetOldNameTranslations AS (
  SELECT
    sont.street_id,
    jsonb_object_agg(sont.language_code, sont.name) AS name
  FROM street_old_name_translations sont
  GROUP BY sont.street_id
),

StreetNewNameTranslations AS (
  SELECT
    snnt.street_id,
    jsonb_object_agg(snnt.language_code, snnt.name) AS name
  FROM street_new_name_translations snnt
  GROUP BY snnt.street_id
),

LaneTranslations AS (
  SELECT
    lt.lane_id,
      jsonb_object_agg(lt.language_code, lt.name) AS name
  FROM lane_translations lt
  GROUP BY lt.lane_id
),
LaneOldNameTranslations AS (
  SELECT
    lot.lane_id,
    jsonb_object_agg(lot.language_code, lot.name) AS name
  FROM lane_old_name_translations lot
  GROUP BY lot.lane_id
),
LaneNewNameTranslations AS (
  SELECT
    lnt.lane_id,
    jsonb_object_agg(lnt.language_code, lnt.name) AS name
  FROM lane_new_name_translations lnt
  GROUP BY lnt.lane_id
),

ImpasseTranslations AS (
  SELECT
    it.impasse_id,
    jsonb_object_agg(it.language_code, it.name) AS name
  FROM impasse_translations it
  GROUP BY it.impasse_id
),
ImpasseOldNameTranslations AS (
  SELECT
    iot.impasse_id,
    jsonb_object_agg(iot.language_code, iot.name) AS name
  FROM impasse_old_name_translations iot
  GROUP BY iot.impasse_id
),
ImpasseNewNameTranslations AS (
  SELECT
    int.impasse_id,
    jsonb_object_agg(int.language_code, int.name) AS name
  FROM impasse_new_name_translations int
  GROUP BY int.impasse_id
), 

PaymentTypes AS (
  SELECT
    pt."organization_id",
    JSON_AGG(
      JSONB_BUILD_OBJECT(
        'id', pt."id",
        'Cash', pt."cash",
        'Terminal', pt."terminal",
        'Transfer', pt."transfer",
        'createdAt', pt."created_at",
        'updatedAt', pt."updated_at",
        'deletedAt', pt."deleted_at"
      )
    )::JSONB AS PaymentTypes
  FROM payment_types pt
  GROUP BY pt."organization_id"
),

PhoneTypesTranslations AS (
  SELECT
    ptit.phone_types_id,
    jsonb_object_agg(ptit.language_code, ptit.name) AS name
  FROM phone_types_id_translations ptit
  GROUP BY ptit.phone_types_id
),

Phones AS (
  SELECT
    p."organization_id",
    JSON_AGG(
      JSONB_BUILD_OBJECT(
        'id', p."id",
        'phone', p."phone",
        'phoneTypeId', p."phone_type_id",
        'isSecret', p."isSecret",
        'OrganizationId', p."organization_id",
        'createdAt', p."created_at",
        'updatedAt', p."updated_at",
        'deletedAt', p."deleted_at",
        'PhoneTypes', JSONB_BUILD_OBJECT(
          'id', pt."id",
          'createdAt', pt."created_at",
          'updatedAt', pt."updated_at",
          'staffNumber', pt."staff_number",
          'name', COALESCE(ptt.name, '{}'::JSONB)
        )
      )
    )::JSONB AS Phones
  FROM phone p
  LEFT JOIN phone_types pt ON p."phone_type_id" = pt."id"
  LEFT JOIN PhoneTypesTranslations ptt ON pt."id" = ptt."phone_types_id"
  GROUP BY p."organization_id"
), 

NearbyTranslations AS (
  SELECT
    nt."nearby_id",
    JSONB_OBJECT_AGG(nt."language_code", nt."name") AS name
  FROM nearby_translations nt
  GROUP BY nt."nearby_id"
),


ProductServiceCategoryTranslations AS (
  SELECT
    pst."product_service_category_id",
    JSONB_OBJECT_AGG(pst."language_code", pst."name") AS name
  FROM product_service_category_translations pst
  GROUP BY pst."product_service_category_id"
),
ProductServiceSubCategoryTranslations AS (
  SELECT
    pst."product_service_sub_category_id",
    JSONB_OBJECT_AGG(pst."language_code", pst."name") AS name
  FROM product_service_sub_category_translations pst
  GROUP BY pst."product_service_sub_category_id"
), 

ProductServices AS (
 SELECT
    ps."organization_id",
    JSON_AGG(
      JSONB_BUILD_OBJECT(
        'id', ps."id",
        'createdAt', ps."created_at",
        'updatedAt', ps."updated_at",
        'deletedAt', ps."deleted_at",
        'ProductServiceCategory', 
          COALESCE(
            JSONB_BUILD_OBJECT(
              'id', psc."id",
              'staffNumber', psc."staff_number",
              'editedStaffNumber', psc."edited_staff_number",
              'status', psc."status",
              'orderNumber', psc."order_number",
              'createdAt', psc."created_at",
              'updatedAt', psc."updated_at",
              'deletedAt', psc."deleted_at",
              'name', COALESCE(pstc."name", '{}'::JSONB)
            ),
            '{}'::JSONB
          ),
        'ProductServiceSubCategory', 
          COALESCE(
            JSONB_BUILD_OBJECT(
              'id', pssc."id",
              'staffNumber', pssc."staff_number",
              'editedStaffNumber', pssc."edited_staff_number",
              'status', pssc."status",
              'productServiceCategoryId', pssc."product_service_category_id",
              'orderNumber', pssc."order_number",
              'createdAt', pssc."created_at",
              'updatedAt', pssc."updated_at",
              'deletedAt', pssc."deleted_at",
              'name', COALESCE(psst."name", '{}'::JSONB)
            ),
            '{}'::JSONB
          )
      )
    )::JSONB AS ProductServices
  FROM product_services ps

  LEFT JOIN product_service_category psc ON ps."product_service_category_id" = psc."id"
  LEFT JOIN ProductServiceCategoryTranslations pstc ON psc."id" = pstc."product_service_category_id"
  LEFT JOIN product_service_sub_category pssc ON ps."product_service_sub_category_id" = pssc."id"
  LEFT JOIN ProductServiceSubCategoryTranslations psst ON pssc."id" = psst."product_service_sub_category_id"
  GROUP BY ps."organization_id"
) , 

    SubCategoryTranslations AS (
        SELECT
            sct.sub_category_id,
          jsonb_object_agg(sct.language_code, sct.name) AS name
        FROM sub_category_translations sct
        GROUP BY sct.sub_category_id
    ) , 
        CategoryTranslations AS (
        SELECT
            ct.category_id,
          jsonb_object_agg(ct.language_code, ct.name) AS name
        FROM category_translations ct
        GROUP BY ct.category_id
    ),

    Pictures AS (
  SELECT
    pic."organization_id",
    JSON_AGG(
      JSONB_BUILD_OBJECT(
        'id', pic."id",
        'link', pic."link",
        'createdAt', pic."created_at",
        'updatedAt', pic."updated_at",
        'deletedAt', pic."deleted_at"
      )
    )::JSONB AS Pictures
  FROM picture pic
  GROUP BY pic."organization_id"
), 
    MainOrganizationTranslations AS (
      SELECT
        mot.main_organization_id,
        jsonb_object_agg(mot.language_code, mot.name) AS name
      FROM main_organization_translations mot
      GROUP BY mot.main_organization_id
    )

    SELECT
    o.id,
    o.name,
    o.staff_number AS "staffNumber",
    o.edited_staff_number AS "editedStaffNumber",
    o.legal_name AS "legalName",
    o.description AS "description",
    o.secret AS "secret",
    o.kvartal AS "kvartal",
    o.address AS "address",
    o.home AS "home",
    o.apartment AS "apartment",
    o.inn AS "inn",
    o.account AS "account",
    o.bank_number AS "bankNumber",
    o.mail AS "mail",
    o.client_id AS "clientId",
    o.manager AS "manager",
    o.index AS "index",
    o.work_time AS "workTime",
    o.transport AS "transport",
    o.created_by AS "createdBy",
    o.main_organization_id AS "mainOrganizationId",
    o.sub_category_id AS "subCategoryId",
    o.residential_id AS "residentialId",
    o.passage_id AS "passageId",
    o.delete_reason AS "deleteReason",
    o.status AS "status",
    o.created_at AS "createdAt",
    o.updated_at AS "updatedAt",
    o.deleted_at AS "deletedAt", 
    o.region_id AS "regionId",
    o.city_id AS "cityId",
    o.district_id AS "districtId",
    o.village_id AS "villageId",
    o.avenue_id AS "avenueId",
    o.impasse_id AS "impasseId",
    o.segment_id AS "segmentId",
    o.neighborhood_id AS "neighborhoodId",
   CAST(COUNT(*) OVER() AS INTEGER) AS "totalCount",
    CASE
      WHEN ${data.role} = ${CreatedByEnum.Moderator} THEN TRUE
      WHEN o.staff_number = ${data.staffNumber} THEN TRUE
      ELSE FALSE
    END AS "operFrom",
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
    END  AS "district",

  CASE
        WHEN village.id IS NOT NULL THEN
            JSONB_BUILD_OBJECT(
        'id', village.id,
        'name', COALESCE(
            (SELECT name FROM VillageTranslations WHERE village_id = village.id),
            '{}'::JSONB
        ),
                'oldName', COALESCE(
            (SELECT name FROM VillageOldNameTranslations WHERE village_id = village.id),
            '{}'::JSONB
        ),
                'newName', COALESCE(
            (SELECT name FROM VillageNewNameTranslations WHERE village_id = village.id),
            '{}'::JSONB
        ),
       'regionId', village.region_id,
        'cityId', village.city_id,
        'districtId', village.district_id,
        'index', village.index,
        'status', village.status,
        'staffNumber', village.staff_number,
        'editedStaffNumber', village.edited_staff_number,
        'orderNumber', village.order_number,
        'createdAt', village.created_at,
        'updatedAt', village.updated_at,
        'deletedAt', village.deleted_at
    )  ELSE NULL
    END AS "village"
    
    , 

    CASE
        WHEN residential_area.id IS NOT NULL THEN
            JSONB_BUILD_OBJECT(
                'id', residential_area.id,
                'name', COALESCE(
                    (SELECT name FROM ResidentialAreaTranslations WHERE residential_area_id = residential_area.id),
                    '{}'::JSONB
                ),
                'oldName', COALESCE(
                    (SELECT name FROM ResidentialAreaOldNameTranslations WHERE residential_area_id = residential_area.id),
                    '{}'::JSONB
                ),
                'newName', COALESCE(
                    (SELECT name FROM ResidentialAreaNewNameTranslations WHERE residential_area_id = residential_area.id),
                    '{}'::JSONB
                ),
                'regionId', residential_area.region_id,
                'cityId', residential_area.city_id,
                'districtId', residential_area.district_id,
                'index', residential_area.index,
                'staffNumber', residential_area.staff_number,
                'editedStaffNumber', residential_area.edited_staff_number,
                'orderNumber', residential_area.order_number,
                'status', residential_area.status,
                'createdAt', residential_area.created_at,
                'updatedAt', residential_area.updated_at,
                'deletedAt', residential_area.deleted_at
            )
        ELSE NULL
    END AS "residentialarea",
   CASE
        WHEN neighborhood.id IS NOT NULL THEN
              JSONB_BUILD_OBJECT(
        'id', neighborhood.id,
        'name', COALESCE(
            (SELECT name FROM NeighborhoodTranslations WHERE neighborhood_id = neighborhood.id),
            '{}'::JSONB
        ),
                'oldName', COALESCE(
            (SELECT name FROM NeighborhoodOldNameTranslations WHERE neighborhood_id = neighborhood.id),
            '{}'::JSONB
        ),
                'newName', COALESCE(
            (SELECT name FROM NeighborhoodNewNameTranslations WHERE neighborhood_id = neighborhood.id),
            '{}'::JSONB
        ),
        'regionId', neighborhood.region_id,
        'cityId', neighborhood.city_id,
        'districtId', neighborhood.district_id,
        'index', neighborhood.index,
        'staffNumber', neighborhood.staff_number,
        'editedStaffNumber', neighborhood.edited_staff_number,
        'orderNumber', neighborhood.order_number,
        'status', neighborhood.status,
        'createdAt', neighborhood.created_at,
        'updatedAt', neighborhood.updated_at,
        'deletedAt', neighborhood.deleted_at
    ) ELSE NULL
    END  AS "neighborhood",  
   CASE
        WHEN area.id IS NOT NULL THEN
               JSONB_BUILD_OBJECT(
        'id', area.id,
        'name', COALESCE(
            (SELECT name FROM AreaTranslations WHERE area_id = area.id),
            '{}'::JSONB
        ),
                'oldName', COALESCE(
            (SELECT name FROM AreaOldNameTranslations WHERE area_id = area.id),
            '{}'::JSONB
        ),
                'newName', COALESCE(
            (SELECT name FROM AreaNewNameTranslations WHERE area_id = area.id),
            '{}'::JSONB
        ),
        'regionId', area.region_id,
        'cityId', area.city_id,
        'districtId', area.district_id,
        'index', area.index,
        'staffNumber', area.staff_number,
        'editedStaffNumber', area.edited_staff_number,
        'orderNumber', area.order_number,
        'status', area.status,
        'createdAt', area.created_at,
        'updatedAt', area.updated_at,
        'deletedAt', area.deleted_at
    ) ELSE NULL
    END  AS "area",  
      CASE
        WHEN street.id IS NOT NULL THEN
                JSONB_BUILD_OBJECT(
        'id', street.id,
        'name', COALESCE(
            (SELECT name FROM StreetTranslations WHERE street_id = street.id),
            '{}'::JSONB
        ),
        'oldName', COALESCE(
            (SELECT name FROM StreetOldNameTranslations WHERE street_id = street.id),
            '{}'::JSONB
        ),
        'newName', COALESCE(
            (SELECT name FROM StreetNewNameTranslations WHERE street_id = street.id),
            '{}'::JSONB
        ),
        'regionId', street.region_id,
        'cityId', street.city_id,
        'districtId', street.district_id,
        'index', street.index,
        'staffNumber', street.staff_number,
        'editedStaffNumber', street.edited_staff_number,
        'orderNumber', street.order_number,
        'status', street.status,
        'createdAt', street.created_at,
        'updatedAt', street.updated_at,
        'deletedAt', street.deleted_at
    ) ELSE NULL
    END  AS "street",
   CASE
        WHEN lane.id IS NOT NULL THEN
                   JSONB_BUILD_OBJECT(
        'id', lane.id,
        'name', COALESCE(
            (SELECT name FROM LaneTranslations WHERE lane_id = lane.id),
            '{}'::JSONB
        ),
        'oldName', COALESCE(
            (SELECT name FROM LaneOldNameTranslations WHERE lane_id = lane.id),
            '{}'::JSONB
        ),
        'newName', COALESCE(
            (SELECT name FROM LaneNewNameTranslations WHERE lane_id = lane.id),
            '{}'::JSONB
        ),
        'regionId', lane.region_id,
        'cityId', lane.city_id,
        'districtId', lane.district_id,
        'index', lane.index,
        'staffNumber', lane.staff_number,
        'editedStaffNumber', lane.edited_staff_number,
        'orderNumber', lane.order_number,
        'status', lane.status,
        'createdAt', lane.created_at,
        'updatedAt', lane.updated_at,
        'deletedAt', lane.deleted_at
    ) ELSE NULL
    END  AS "lane", 

   CASE
        WHEN impasse.id IS NOT NULL THEN
        JSONB_BUILD_OBJECT(
        'id', impasse.id,
        'name', COALESCE(
            (SELECT name FROM ImpasseTranslations WHERE impasse_id = impasse.id),
            '{}'::JSONB
        ),
        'oldName', COALESCE(
            (SELECT name FROM ImpasseOldNameTranslations WHERE impasse_id = impasse.id),
            '{}'::JSONB
        ),
        'newName', COALESCE(
            (SELECT name FROM ImpasseNewNameTranslations WHERE impasse_id = impasse.id),
            '{}'::JSONB
        ),
        'regionId', impasse.region_id,
        'cityId', impasse.city_id,
        'districtId', impasse.district_id,
        'index', impasse.index,
        'staffNumber', impasse.staff_number,
        'editedStaffNumber', impasse.edited_staff_number,
        'orderNumber', impasse.order_number,
        'status', impasse.status,
        'createdAt', impasse.created_at,
        'updatedAt', impasse.updated_at,
        'deletedAt', impasse.deleted_at
    ) ELSE NULL
    END  AS "impasse", 
   CASE
        WHEN sub_category.id IS NOT NULL THEN
        JSONB_BUILD_OBJECT(
        'id', sub_category.id,
        'staffNumber', sub_category.staff_number,
        'editedStaffNumber', sub_category.edited_staff_number,
        'status', sub_category.status,
        'categoryId', sub_category.category_id,
        'orderNumber', sub_category.order_number,
        'createdAt', sub_category.created_at,
        'updatedAt', sub_category.updated_at,
        'deletedAt', sub_category.deleted_at,
        'name',  COALESCE(
            (SELECT name FROM SubCategoryTranslations WHERE sub_category_id = sub_category.id),
            '{}'::JSONB
        )
        
    ) ELSE NULL
    END  AS "subcategory",
   CASE
        WHEN category.id IS NOT NULL THEN
         JSONB_BUILD_OBJECT(
            'id', category.id,
            'staffNumber', category.staff_number,
            'editedStaffNumber', category.edited_staff_number,
            'status', category.status,
            'regionId', category.region_id,
            'cityId', category.city_id,
            'districtId', category.district_id,
            'orderNumber', category.order_number,
            'createdAt', category.created_at,
            'updatedAt', category.updated_at,
            'deletedAt', category.deleted_at,
            'name', COALESCE(
            (SELECT name FROM CategoryTranslations WHERE category_id = category.id),
            '{}'::JSONB
            )
        ) ELSE NULL
    END  AS "category",

  COALESCE(
    (SELECT PaymentTypes FROM PaymentTypes WHERE organization_id = o.id),
    '[]'::JSONB
  ) AS "PaymentTypes",
    COALESCE(
    (SELECT Phones FROM Phones WHERE "organization_id" = o.id),
    '[]'::JSONB
  ) AS "Phone",
  -- boshlanishi 
(
  SELECT CASE 
    WHEN COUNT(nb.*) = 0 THEN '[]'::jsonb
    ELSE JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'id', nb."id",
        'description', nb."description",
        'NearbyId', nb."nearby_id",
        'createdAt', nb."created_at",
        'updatedAt', nb."updated_at",
        'deletedAt', nb."deleted_at",
        'Nearby', CASE 
          WHEN n."id" IS NULL THEN '{}'::jsonb
          ELSE JSONB_BUILD_OBJECT(
            'id', n."id",
            'staffNumber', n."staff_number",
            'editedStaffNumber', n."edited_staff_number",
            'status', n."status",
            'nearbyCategoryId', n."nearby_category_id",
            'regionId', n."region_id",
            'cityId', n."city_id",
            'districtId', n."district_id",
            'orderNumber', n."order_number",
            'createdAt', n."created_at",
            'deletedAt', n."deleted_at",
            'updatedAt', n."updated_at",
            'name', COALESCE(nt."name", '{}'::jsonb)
          )
        END,
        'NearbyCategory', CASE
          WHEN nc."id" IS NULL THEN '{}'::jsonb
          ELSE JSONB_BUILD_OBJECT(
            'id', nc."id",
            'name', nc."name",
            'staffNumber', nc."staff_number",
            'editedStaffNumber', nc."edited_staff_number",
            'status', nc."status",
            'orderNumber', nc."order_number",
            'createdAt', nc."created_at",
            'updatedAt', nc."updated_at",
            'deletedAt', nc."deleted_at"
          )
        END
      )
    )
  END
  FROM nearbees nb
  LEFT JOIN nearby n ON nb."nearby_id" = n."id"
  LEFT JOIN NearbyTranslations nt ON n."id" = nt."nearby_id"
  LEFT JOIN nearby_category nc ON n."nearby_category_id" = nc."id"
  WHERE nb."organization_version_id" = o.id
) AS "Nearbees" ,

  COALESCE(
  (SELECT ProductServices FROM ProductServices WHERE "organization_id" = o.id),
  '[]'::JSONB
) AS "ProductServices",
  COALESCE(pic.Pictures, '[]'::JSONB) AS "Picture",

      CASE
        WHEN main_organization.id IS NOT NULL THEN
        JSONB_BUILD_OBJECT(
    'id', main_organization.id,
    'name', COALESCE(
            (SELECT name FROM MainOrganizationTranslations WHERE main_organization_id = main_organization.id),
            '{}'::JSONB
            ),
    'status', main_organization.status,
    'staffNumber' , main_organization.staff_number,
    'editedStaffNumber' , main_organization.edited_staff_number,
    'orderNumber' , main_organization.order_number,
    'createdAt', main_organization.created_at,
    'updatedAt', main_organization.updated_at,
    'deletedAt', main_organization.deleted_at
  ) ELSE NULL
    END  AS "mainorganization",
    CASE
        WHEN segment.id IS NOT NULL THEN
        JSONB_BUILD_OBJECT(
    'id', segment.id,
    'name', segment.name,
    'status', segment.status,
    'createdAt', segment.created_at,
    'orderNumber' , segment.order_number,
    'updatedAt', segment.updated_at,
    'deletedAt', segment.deleted_at
  ) ELSE NULL
    END  AS "segment"
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
    SELECT * FROM Pictures pic WHERE pic.organization_id = o.id LIMIT 1
) pic ON true
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
