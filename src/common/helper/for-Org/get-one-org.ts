import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatedByEnum } from 'types/global';
import { OrganizationFilterDto } from 'types/organization/organization/dto/filter-organization.dto';

export async function getOneOrgOptimizedQuery(
  id: number,
  prisma: PrismaService,
  pagination?: { take: number; skip: number }
) {
  const conditions: Prisma.Sql[] = [];
  let whereClause = Prisma.empty;

  whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  try {
    const result: any = await prisma.$queryRaw(Prisma.sql`
    -- CTE for MainOrganization translations in all languages
    WITH MainOrganizationTranslations AS (
      SELECT
        mot.main_organization_id,
        jsonb_object_agg(mot.language_code, mot.name) AS name
      FROM main_organization_translations mot
      GROUP BY mot.main_organization_id
    ),

    -- CTE for City translations in all languages
        CityTranslations AS (
      SELECT
        ct.city_id,
        jsonb_object_agg(ct.language_code, ct.name) AS name
      FROM city_translations ct
      GROUP BY ct.city_id
    ),

    -- CTE for Region translations in all languages
        RegionTranslations AS (
      SELECT
        rt.region_id,
        jsonb_object_agg(rt.language_code, rt.name) AS name
      FROM region_translations rt
      GROUP BY rt.region_id
    ),

    -- CTE for District translations in all languages
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

    -- CTE for Village translations in all languages
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

    -- CTE for ResidentialArea translations in all languages
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

    -- CTE for Neighborhood translations in all languages
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

    -- CTE for Area translations in all languages
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

    -- CTE for Street translations in all languages
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

    -- CTE for Lane translations in all languages
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

    -- CTE for Impasse translations in all languages
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

    -- CTE for PhoneType translations in all languages
    PhoneTypesTranslations AS (
      SELECT
        ptit.phone_types_id,
        jsonb_object_agg(ptit.language_code, ptit.name) AS name
      FROM phone_types_id_translations ptit
      GROUP BY ptit.phone_types_id
    ),

    -- CTE for Nearby translations in all languages
    NearbyTranslations AS (
      SELECT
        nyt."nearby_id",
        JSONB_OBJECT_AGG(nyt."language_code", nyt."name") AS name
      FROM nearby_translations nyt
      GROUP BY nyt."nearby_id"
    ),
    -- CTE for ProductServiceCategory translations in all languages
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

    -- CTE for SubCategory translations in all languages
    SubCategoryTranslations AS (
      SELECT
          sct.sub_category_id,
        jsonb_object_agg(sct.language_code, sct.name) AS name
      FROM sub_category_translations sct
      GROUP BY sct.sub_category_id
    ),

    -- CTE for Category translations in all languages
    CategoryTranslations AS (
       SELECT
           cat.category_id,
         jsonb_object_agg(cat.language_code, cat.name) AS name
       FROM category_translations cat
       GROUP BY cat.category_id
    )

    SELECT  
      o.id,
      o.name, 
      o.address, 
      o.status,
      o.work_time AS "workTime",
      o.staff_number AS "staffNumber",
      o.edited_staff_number AS "editedStaffNumber",
      o.legal_name AS "legalName",
      o.description AS "description",
      o.secret AS "secret",
      o.kvartal AS "kvartal",
      o.home AS "home",
      o.apartment AS "apartment",
      o.inn AS "inn",
      o.socials AS "social",
      o.logo AS "logo",
      o.certificate AS "certificate",
      o.account AS "account",
      o.bank_number AS "bankNumber",
      o.mail AS "mail",
      o.client_id AS "clientId",
      o.manager AS "manager",
      o.index AS "index",
      o.transport AS "transport",
      o.created_by AS "createdBy",
      o.main_organization_id AS "mainOrganizationId",
      o.sub_category_id AS "subCategoryId",
      o.residential_id AS "residentialId",
      o.passage_id AS "passageId",
      o.delete_reason AS "deleteReason",
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

    
    
      -- MainOrganization object with translations
      CASE 
        WHEN mo.id IS NOT NULL THEN jsonb_build_object(
          'id', mo.id,
          'name', COALESCE(mot.name, '{}'::jsonb),
          'staffNumber', mo.staff_number,
          'editedStaffNumber', mo.edited_staff_number,
          'status', mo.status,
          'orderNumber', mo.order_number,
          'createdAt', mo.created_at,
          'updatedAt', mo.updated_at,
          'deletedAt', mo.deleted_at
        )
        ELSE NULL
      END AS "mainOrganization",

        -- Aggregate city
      json_agg(
        jsonb_build_object(
          'id', c.id,
          'name', COALESCE(ct.name, '{}'::jsonb),
          'regionId', c.region_id,
          'status', c.status,
          'createdAt', c.created_at,
          'updatedAt', c.updated_at,
          'deletedAt', c.deleted_at
        )
      ) FILTER (WHERE c.id IS NOT NULL)->0 AS "city",

      -- Aggregate region
      json_agg(
        jsonb_build_object(
          'id', region.id,
          'name', COALESCE(rt.name, '{}'::jsonb),
          'status', region.status,
          'createdAt', region.created_at,
          'updatedAt', region.updated_at,
          'deletedAt', region.deleted_at
        )
      ) FILTER (WHERE region.id IS NOT NULL)->0 AS "region",

      -- Aggregate district
      json_agg(
        jsonb_build_object(
          'id', district.id,
          'name', COALESCE(dt.name, '{}'::jsonb),
          'oldName', COALESCE(dot.name, '{}'::jsonb),
          'newName', COALESCE(dnt.name, '{}'::jsonb),
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
        )
      ) FILTER (WHERE district.id IS NOT NULL) -> 0 AS "district",

      -- Aggregate village
      json_agg(
        jsonb_build_object(
          'id', village.id,
          'name', COALESCE(vt.name, '{}'::jsonb),
          'oldName', COALESCE(vot.name, '{}'::jsonb),
          'newName', COALESCE(vnt.name, '{}'::jsonb),
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
        )
      ) FILTER (WHERE village.id IS NOT NULL) -> 0 AS "village",

      -- Aggregate avenue
      json_agg(
        jsonb_build_object(
          'id', residential_area.id,
          'name', COALESCE(rat.name, '{}'::jsonb),
          'oldName', COALESCE(raot.name, '{}'::jsonb),
          'newName', COALESCE(rant.name, '{}'::jsonb),
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
      ) FILTER (WHERE residential_area.id IS NOT NULL) -> 0 AS "residentialArea" ,

      -- Aggregate neighborhood
      json_agg(
        jsonb_build_object(
          'id', neighborhood.id,
          'name', COALESCE(nt.name, '{}'::jsonb),
          'oldName', COALESCE(nott.name, '{}'::jsonb),
          'newName', COALESCE(nnt.name, '{}'::jsonb),
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
        )
      ) FILTER (WHERE neighborhood.id IS NOT NULL) -> 0 AS "neighborhood",

      -- Aggregate area
      json_agg(
        jsonb_build_object(
          'id', area.id,
          'name', COALESCE(at.name, '{}'::jsonb),
          'oldName', COALESCE(aot.name, '{}'::jsonb),
          'newName', COALESCE(ant.name, '{}'::jsonb),
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
        )
      ) FILTER (WHERE area.id IS NOT NULL) -> 0 AS "area",

      -- Aggregate street
      json_agg(
        jsonb_build_object(
          'id', street.id,
          'name', COALESCE(st.name, '{}'::jsonb),
          'oldName', COALESCE(sont.name, '{}'::jsonb),
          'newName', COALESCE(snnt.name, '{}'::jsonb),
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
        )
      ) FILTER (WHERE street.id IS NOT NULL) -> 0 AS "street" ,

      -- Aggregate lane
      json_agg(
        jsonb_build_object(
          'id', lane.id,
          'name', COALESCE(lt.name, '{}'::jsonb),
          'oldName', COALESCE(lot.name, '{}'::jsonb),
          'newName', COALESCE(lnt.name, '{}'::jsonb),
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
        )
      ) FILTER (WHERE lane.id IS NOT NULL) -> 0 AS "lane", 

      -- Aggregate impasse
      json_agg(
        jsonb_build_object(
          'id', impasse.id,
          'name', COALESCE(it.name, '{}'::jsonb),
          'oldName', COALESCE(iot.name, '{}'::jsonb),
          'newName', COALESCE(int.name, '{}'::jsonb),
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
        )
      ) FILTER (WHERE impasse.id IS NOT NULL) -> 0 AS "impasse",

      -- Aggregate payment type
      json_agg(
        jsonb_build_object(
          'id', pty.id,
          'Cash', pty.cash,
          'Terminal', pty.terminal,
          'Transfer', pty.transfer,
          'createdAt', pty.created_at,
          'updatedAt', pty.updated_at,
          'deletedAt', pty.deleted_at
        )
      ) FILTER (WHERE pty.id IS NOT NULL) -> 0 AS "PaymentTypes",

      -- Aggregate phone
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', ph.id,
            'phone', ph.phone,
            'phoneTypeId', ph.phone_type_id,
            'isSecret', ph."isSecret",
            'OrganizationId', ph.organization_id,
            'createdAt', ph.created_at,
            'updatedAt', ph.updated_at,
            'deletedAt', ph.deleted_at,
            'PhoneTypes', jsonb_build_object(
              'id', pht.id,
              'createdAt', pht.created_at,
              'updatedAt', pht.updated_at,
              'staffNumber', pht.staff_number,
              'name', COALESCE(ptit.name, '{}'::jsonb)
            )
          )
        ) FILTER (WHERE ph.id IS NOT NULL),
        '[]'::json
      ) AS "Phone",

      -- Aggregate nearby
       COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', nb.id,
            'description', nb.description,
            'NearbyId', nb.nearby_id,
            'createdAt', nb.created_at,
            'updatedAt', nb.updated_at,
            'deletedAt', nb.deleted_at,
            'Nearby', COALESCE(
              jsonb_build_object(
                'id', n.id,
                'staffNumber', n.staff_number,
                'editedStaffNumber', n.edited_staff_number,
                'status', n.status,
                'nearbyCategoryId', n.nearby_category_id,
                'regionId', n.region_id,
                'cityId', n.city_id,
                'districtId', n.district_id,
                'orderNumber', n.order_number,
                'createdAt', n.created_at,
                'deletedAt', n.deleted_at,
                'updatedAt', n.updated_at,
                'name',  COALESCE(nyt.name, '{}'::jsonb)
              ),
              '{}'::jsonb
            ),
            'NearbyCategory', COALESCE(
              jsonb_build_object(
                'id', nc.id,
                'name', nc.name,
                'staffNumber', nc.staff_number,
                'editedStaffNumber', nc.edited_staff_number,
                'status', nc.status,
                'orderNumber', nc.order_number,
                'createdAt', nc.created_at,
                'updatedAt', nc.updated_at,
                'deletedAt', nc.deleted_at
              ),
              '{}'::jsonb
            )
          )
        ) FILTER (WHERE nb.id IS NOT NULL),
        '[]'::json
      ) AS "Nearbees",

      -- Aggregate product service
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', ps.id,
            'createdAt', ps.created_at,
            'updatedAt', ps.updated_at,
            'deletedAt', ps.deleted_at,
            'ProductServiceCategory', 
              COALESCE(
                jsonb_build_object(
                  'id', psc.id,
                  'staffNumber', psc.staff_number,
                  'editedStaffNumber', psc.edited_staff_number,
                  'status', psc.status,
                  'orderNumber', psc.order_number,
                  'createdAt', psc.created_at,
                  'updatedAt', psc.updated_at,
                  'deletedAt', psc.deleted_at,
                  'name', COALESCE(to_jsonb(pstc.name), '{}'::jsonb)
                ),
                '{}'::jsonb
              ),
            'ProductServiceSubCategory', 
              COALESCE(
                jsonb_build_object(
                  'id', pssc.id,
                  'staffNumber', pssc.staff_number,
                  'editedStaffNumber', pssc.edited_staff_number,
                  'status', pssc.status,
                  'productServiceCategoryId', pssc.product_service_category_id,
                  'orderNumber', pssc.order_number,
                  'createdAt', pssc.created_at,
                  'updatedAt', pssc.updated_at,
                  'deletedAt', pssc.deleted_at,
                  'name', COALESCE(to_jsonb(psst.name), '{}'::jsonb)
                ),
                '{}'::jsonb
              )
          )
        ) FILTER (WHERE ps.id IS NOT NULL),
        '[]'::json
      ) AS "ProductServices",

      -- Aggregate sub category
      json_agg(
        jsonb_build_object(
          'id', sub_category.id,
          'staffNumber', sub_category.staff_number,
          'editedStaffNumber', sub_category.edited_staff_number,
          'status', sub_category.status,
          'categoryId', sub_category.category_id,
          'orderNumber', sub_category.order_number,
          'createdAt', sub_category.created_at,
          'updatedAt', sub_category.updated_at,
          'deletedAt', sub_category.deleted_at,
          'name', COALESCE(to_jsonb(sct.name), '{}'::jsonb)
        )
      ) FILTER (WHERE sub_category.id IS NOT NULL) -> 0 AS "subCategory",

      -- Aggregate category
      json_agg(
        jsonb_build_object(
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
          'name', COALESCE(to_jsonb(cat.name), '{}'::jsonb)
        )
      ) FILTER (WHERE category.id IS NOT NULL) -> 0 AS "category",

      -- Aggregate picture
      COALESCE(
        json_agg(
          jsonb_build_object(
            'id', pic.id,
            'link', pic.link,
            'createdAt', pic.created_at,
            'updatedAt', pic.updated_at,
            'deletedAt', pic.deleted_at
          )
        ) FILTER (WHERE pic.id IS NOT NULL),
        '[]'::json
      ) AS "Pictures"

    FROM organization o
      
    -- Main Organization
    LEFT JOIN main_organization mo ON o.main_organization_id = mo.id
      
    -- Join with CTE for main organization translations
    LEFT JOIN MainOrganizationTranslations mot ON mo.id = mot.main_organization_id

   -- City
    LEFT JOIN city c ON o.city_id = c.id
      
    -- Join with CTE for city translations
    LEFT JOIN CityTranslations ct ON c.id = ct.city_id
      
    -- Region
    LEFT JOIN region ON o.region_id = region.id
      
    -- Join with CTE for region translations
    LEFT JOIN RegionTranslations rt ON region.id = rt.region_id
      
    -- District
    LEFT JOIN district ON o.district_id = district.id
      
    -- Join with CTE for district translations
    LEFT JOIN DistrictTranslations dt ON district.id = dt.district_id
      
    -- Join with CTE for  district old translations
    LEFT JOIN DistrictOldNameTranslations dot ON district.id = dot.district_id
      
    -- Join with CTE for new district translations
    LEFT JOIN DistrictNewNameTranslations dnt ON district.id = dnt.district_id
    
    -- Village
    LEFT JOIN village ON o.village_id = village.id
      
    -- Join with CTE for village translations
    LEFT JOIN VillageTranslations vt ON village.id = vt.village_id

    -- Join with CTE for  village old translations
    LEFT JOIN VillageOldNameTranslations vot ON village.id = vot.village_id

    -- Join with CTE for new village translations
    LEFT JOIN VillageNewNameTranslations vnt ON village.id = vnt.village_id

    -- Residence
    LEFT JOIN residential_area ON o.residential_id = residential_area.id
      
    -- Join with CTE for residence translations
    LEFT JOIN ResidentialAreaTranslations rat ON residential_area.id = rat.residential_area_id
      
    -- Join with CTE for residence old translations
    LEFT JOIN ResidentialAreaOldNameTranslations raot ON residential_area.id = raot.residential_area_id
      
    -- Join with CTE for new residence translations
    LEFT JOIN ResidentialAreaNewNameTranslations rant ON residential_area.id = rant.residential_area_id

    --neighborhood
    LEFT JOIN neighborhood ON o.neighborhood_id = neighborhood.id
      
    -- Join with CTE for neighborhood translations
    LEFT JOIN NeighborhoodTranslations nt ON neighborhood.id = nt.neighborhood_id
      
    -- Join with CTE for neighborhood old translations
    LEFT JOIN NeighborhoodOldNameTranslations nott ON neighborhood.id = nott.neighborhood_id
      
    -- Join with CTE for new neighborhood translations
    LEFT JOIN NeighborhoodNewNameTranslations nnt ON neighborhood.id = nnt.neighborhood_id

    --area
    LEFT JOIN area ON o.area_id = area.id
      
    -- Join with CTE for area translations
    LEFT JOIN AreaTranslations at ON area.id = at.area_id
      
    -- Join with CTE for area old translations
    LEFT JOIN AreaOldNameTranslations aot ON area.id = aot.area_id
      
    -- Join with CTE for new area translations
    LEFT JOIN AreaNewNameTranslations ant ON area.id = ant.area_id

    --street 
    LEFT JOIN street ON o.street_id = street.id
      
    -- Join with CTE for street translations
    LEFT JOIN StreetTranslations st ON street.id = st.street_id
      
    -- Join with CTE for street old translations
    LEFT JOIN StreetOldNameTranslations sont ON street.id = sont.street_id
      
    -- Join with CTE for new street translations
    LEFT JOIN StreetNewNameTranslations snnt ON street.id = snnt.street_id

    --lane
    LEFT JOIN lane ON o.lane_id = lane.id
      
    -- Join with CTE for lane translations
    LEFT JOIN LaneTranslations lt ON lane.id = lt.lane_id
      
    -- Join with CTE for lane old translations
    LEFT JOIN LaneOldNameTranslations lot ON lane.id = lot.lane_id
      
    -- Join with CTE for new lane translations
    LEFT JOIN LaneNewNameTranslations lnt ON lane.id = lnt.lane_id

    --impasse 
    LEFT JOIN impasse ON o.impasse_id = impasse.id
      
    -- Join with CTE for impasse translations
    LEFT JOIN ImpasseTranslations it ON impasse.id = it.impasse_id
      
    -- Join with CTE for impasse old translations
    LEFT JOIN ImpasseOldNameTranslations iot ON impasse.id = iot.impasse_id
      
    -- Join with CTE for new impasse translations
    LEFT JOIN ImpasseNewNameTranslations int ON impasse.id = int.impasse_id

    --paymentTypes
    LEFT JOIN payment_types pty ON pty.organization_id = o.id

    -- phone
    LEFT JOIN phone ph ON ph.organization_id = o.id

    --phone types
    LEFT JOIN phone_types pht ON pht.id = ph.phone_type_id

    -- Join with CTE for new phone types translations
    LEFT JOIN PhoneTypesTranslations ptit ON ptit.phone_types_id = pht.id  

    --nearbees
    LEFT JOIN nearbees nb ON nb.organization_version_id = o.id

    --nearby
    LEFT JOIN nearby n ON nb.nearby_id = n.id

    --nearby translations
    LEFT JOIN NearbyTranslations nyt ON nyt.nearby_id = n.id

    --nearby category
    LEFT JOIN nearby_category nc ON n.nearby_category_id = nc.id
    
    --product services
    LEFT JOIN product_services ps ON ps.organization_id = o.id

    --product service category
    LEFT JOIN product_service_category psc ON ps.product_service_category_id = psc.id
    
    --product service category translations
    LEFT JOIN ProductServiceCategoryTranslations pstc ON pstc.product_service_category_id = psc.id
    
    --product service sub category
    LEFT JOIN product_service_sub_category pssc ON ps.product_service_sub_category_id = pssc.id
    
    --product service sub category translations
    LEFT JOIN ProductServiceSubCategoryTranslations psst ON psst.product_service_sub_category_id = pssc.id
    
    --sub category
    LEFT JOIN sub_category ON o.sub_category_id = sub_category.id

    --sub category translations
    LEFT JOIN SubCategoryTranslations sct ON sct.sub_category_id = sub_category.id

    --category
    LEFT JOIN category ON sub_category.category_id = category.id
    
    --category translations
    LEFT JOIN CategoryTranslations cat ON cat.category_id = category.id

    --Pictures
    LEFT JOIN picture pic ON pic.organization_id = o.id

    WHERE o.id = ${Prisma.raw(String(id))}

    GROUP BY o.id, mo.id, mot.name;
  `);

    return result;
  } catch (error) {
    console.log(error.message);
  }
}
