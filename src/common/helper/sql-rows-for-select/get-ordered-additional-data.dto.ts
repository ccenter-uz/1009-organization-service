import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Roles } from 'types/global';

export async function getAllAdditional(
  prisma: PrismaService,
  data: any,
  pagination?: { take: number; skip: number }
) {
  const conditions: Prisma.Sql[] = [];

  if (data.role !== Roles.MODERATOR) {
    conditions.push(Prisma.sql`a.status = 1`);
  }

  if (data.status === 0 || data.status === 1) {
    conditions.push(Prisma.sql`a.status = ${data.status}`);
  }

  if (data.additionalCategoryId) {
    conditions.push(
      Prisma.sql`a.additional_category_id = ${data.additionalCategoryId}`
    );
  }

  if (data.search) {
    conditions.push(Prisma.sql`
      EXISTS (
        SELECT 1
        FROM additional_translations at
        WHERE at.additional_id = a.id
        AND at.name ILIKE ${`%${data.search}%`}
        LIMIT 1
      )
    `);
  }

  const whereClause = conditions.length
    ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
    : Prisma.empty;

  const result: any = await prisma.$queryRaw(
    Prisma.sql`
      WITH 
        AdditionalTranslations AS (
          SELECT
            at.additional_id,
           jsonb_object_agg(language_code, name)  AS translations
          FROM additional_translations at
          WHERE (${data.allLang} = TRUE OR ${data.langCode ? Prisma.sql`at.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
          GROUP BY at.additional_id
        ),
        
        AdditionalWarningTranslations AS (
          SELECT
            awt.additional_id,
            jsonb_object_agg(language_code, name) AS warnings
          FROM additional_warning_translations awt
          WHERE (${data.allLang} = TRUE OR ${data.langCode ? Prisma.sql`awt.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
          GROUP BY awt.additional_id
        ),
        
        AdditionalMentionTranslations AS (
          SELECT
            amt.additional_id,
           jsonb_object_agg(language_code, name) AS mentions
          FROM additional_mention_translations amt
          WHERE (${data.allLang} = TRUE OR ${data.langCode ? Prisma.sql`amt.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
          GROUP BY amt.additional_id
        ),

        AdditionalContent AS (
          SELECT
            ac.additional_id,
            JSON_AGG(
              JSONB_BUILD_OBJECT(
                'id', ac.id,
                'status', ac.status,
                'createdAt', ac.created_at,
                'updatedAt', ac.updated_at,
                'deletedAt', ac.deleted_at,
                'name', (
                  SELECT JSONB_OBJECT_AGG(acnt.language_code, acnt.name)
                  FROM additional_content_name_translations acnt
                  WHERE acnt.additional_content_id = ac.id
                ),
                'content', (
                  SELECT JSONB_OBJECT_AGG(acct.language_code, acct.name)
                  FROM additional_content_content_translations acct
                  WHERE acct.additional_content_id = ac.id
                )
              )
            )::JSONB AS content
          FROM additional_content ac
          GROUP BY ac.additional_id
        ),

        AdditionalTable AS (
          SELECT
            atb.additional_id,
            JSON_AGG(
              JSONB_BUILD_OBJECT(
                'id', atb.id,
                'status', atb.status,
                'createdAt', atb.created_at,
                'updatedAt', atb.updated_at,
                'deletedAt', atb.deleted_at,
                'name', (
                  SELECT JSONB_OBJECT_AGG(atnt.language_code, atnt.name)
                  FROM additional_table_name_translations atnt
                  WHERE atnt.additional_table_id = atb.id
                ),
                'content', (
                  SELECT JSONB_OBJECT_AGG(atct.language_code, atct.name)
                  FROM additional_table_content_translations atct
                  WHERE atct.additional_table_id = atb.id
                )
              )
            )::JSONB AS tables
          FROM additional_table atb
          GROUP BY atb.additional_id
        )

      SELECT
        --a.*,
        a.id AS "id",
        a.staff_number AS "staffNumber",
        a.additional_category_id AS "additionalCategoryId",
        a.status AS "status",
        a.edited_staff_number AS "editedStaffNumber",
        a.created_at AS "createdAt",
        a.updated_at AS "updatedAt",
        a.deleted_at AS "deletedAt",
        at.translations AS "name",
        awt.warnings AS "warning",
        amt.mentions AS "mention",
        ac.content AS "content",
        atb.tables AS "table"
      FROM additional a
      LEFT JOIN AdditionalTranslations at ON at.additional_id = a.id
      LEFT JOIN AdditionalWarningTranslations awt ON awt.additional_id = a.id
      LEFT JOIN AdditionalMentionTranslations amt ON amt.additional_id = a.id
      LEFT JOIN AdditionalContent ac ON ac.additional_id = a.id
      LEFT JOIN AdditionalTable atb ON atb.additional_id = a.id
      ${whereClause}
      GROUP BY a.id, at.translations, awt.warnings, amt.mentions, ac.content, atb.tables
      ORDER BY (
        SELECT jsonb_extract_path_text(at.translations::jsonb->0, 'name')
      ) ASC
      ${pagination ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}` : Prisma.empty}
    `
  );

  return result;
}
