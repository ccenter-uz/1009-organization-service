import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatedByEnum } from 'types/global';
import { OrganizationFilterDto } from 'types/organization/organization/dto/filter-organization.dto';

export async function getOrgOptimizedQuery(
  data: OrganizationFilterDto,
  prisma: PrismaService,
  pagination?: { take: number; skip: number }
) {
  const conditions: Prisma.Sql[] = [];
  let whereClause = Prisma.empty;

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

  if (data.subCategoryId) {
    conditions.push(Prisma.sql`o.sub_category_id = ${data.subCategoryId}`);
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

  whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  const result = await prisma.$queryRaw(Prisma.sql`
    -- CTE for MainOrganization translations in all languages
    WITH MainOrganizationTranslations AS (
      SELECT
        mot.main_organization_id,
        jsonb_object_agg(mot.language_code, mot.name) AS name
      FROM main_organization_translations mot
      GROUP BY mot.main_organization_id
    )

    SELECT  
      o.id,
      o.name, 
      o.address, 
      o.status, 
      o.created_at AS "createdAt",
      o.legal_name AS "legalName",
      o.work_time AS "workTime",
      o.transport,

      -- Aggregate phones
      json_agg(
        json_build_object(
          'id', p.id,
          'phone', p.phone,
          'isSecret', p."isSecret",
          'phoneTypeId', p.phone_type_id
        )
      ) FILTER (WHERE p.id IS NOT NULL) AS phones,
    
      -- Aggregate payment types
      json_agg(
        json_build_object(
          'id', pt.id,
          'Cash', pt.cash,
          'Terminal', pt.terminal,
          'Transfer', pt.transfer,
          'createdAt', pt.created_at,
          'updatedAt', pt.updated_at,
          'deletedAt', pt.deleted_at
        )
      ) FILTER (WHERE pt.id IS NOT NULL) AS "paymentTypes",
    
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
      END AS "mainOrganization"
      
    FROM organization o
      
    -- Phones
    LEFT JOIN phone p ON o.id = p.organization_id
      
    -- Payment Types
    LEFT JOIN payment_types pt ON o.id = pt.organization_id
      
    -- Main Organization
    LEFT JOIN main_organization mo ON o.main_organization_id = mo.id
      
    -- Join with CTE for main organization translations
    LEFT JOIN MainOrganizationTranslations mot ON mo.id = mot.main_organization_id
      
    GROUP BY o.id, mo.id, mot.name;
  `);

  return result;
}
