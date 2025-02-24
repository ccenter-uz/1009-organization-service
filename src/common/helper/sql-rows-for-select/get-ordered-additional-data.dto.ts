import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {  Roles } from 'types/global';

export async function getAllAdditional(
  prisma: PrismaService,
  data: any,
  pagination?: { take: number; skip: number }
) {
  const conditions: Prisma.Sql[] = [];
  if (data.role !== Roles.MODERATOR) {
    conditions.push(Prisma.sql`a.status = 1`);
  }
  if (data.status === 0 || data.status === 1)
    conditions.push(Prisma.sql`a.status = ${data.status}`);

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
                  ORDER BY at.language_code   
                  LIMIT 1
              )
          `);
  }

  const whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  const result: any = await prisma.$queryRaw(
    Prisma.sql`
      WITH
        AdditionalTranslations AS (
          SELECT
            at.additional_id,
            JSON_AGG(
              JSONB_BUILD_OBJECT(
                'languageCode', at.language_code,
                'name', at.name
              )
            )::JSONB AS AdditionalTranslations  
          FROM additional_translations at
          WHERE (${data.allLang} = TRUE OR ${data.langCode ? Prisma.sql`at.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
          GROUP BY at.additional_id
        ),
        AdditionalWarningTranslations AS (
          SELECT
            awt.additional_id,
            JSON_AGG(
              JSONB_BUILD_OBJECT(
                'languageCode', awt.language_code,
                'name', awt.name
              )
            )::JSONB AS AdditionalWarningTranslations  
          FROM additional_warning_translations awt
          WHERE (${data.allLang} = TRUE OR ${data.langCode ? Prisma.sql`awt.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
          GROUP BY awt.additional_id
        ),
        AdditionalMentionTranslations AS (
          SELECT
            amt.additional_id,
            JSON_AGG(
              JSONB_BUILD_OBJECT(
                'languageCode', amt.language_code,
                'name', amt.name
              )
            )::JSONB AS AdditionalMentionTranslations  
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
              'additionalId', ac.additional_id,
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
          )::JSONB AS AdditionalContent
        FROM additional_content ac
        GROUP BY ac.additional_id
      ),AdditionalTable AS (
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
              SELECT JSON_OBJECT_AGG(
                atnt.language_code, atnt.name
              ) FROM additional_table_name_translations atnt
              WHERE atnt.additional_table_id = atb.id
            ),
            'content', (
              SELECT JSON_OBJECT_AGG(
                atct.language_code, atct.name
              ) FROM additional_table_content_translations atct
              WHERE atct.additional_table_id = atb.id
            )
          )
        )::JSONB AS AdditionalTable
      FROM additional_table atb
      GROUP BY atb.additional_id
    )

      SELECT
        a.*,
        (SELECT AdditionalTranslations FROM AdditionalTranslations WHERE additional_id = a.id) AS "AdditionalTranslations",
        (SELECT AdditionalWarningTranslations FROM AdditionalWarningTranslations WHERE additional_id = a.id) AS "AdditionalWarningTranslations",
        (SELECT AdditionalMentionTranslations FROM AdditionalMentionTranslations WHERE additional_id = a.id) AS "AdditionalMentionTranslations",
        (SELECT AdditionalContent FROM AdditionalContent WHERE additional_id = a.id) AS "content",
        (SELECT AdditionalTable FROM AdditionalTable WHERE additional_id = a.id) AS "table"
      FROM
        additional a
      ${whereClause}
      GROUP BY a.id
      ORDER BY (
      SELECT jsonb_extract_path_text(AdditionalTranslations::jsonb->0, 'name')
      FROM AdditionalTranslations 
      WHERE additional_id = a.id
    ) ASC
      ${pagination ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}` : Prisma.empty}
    `
  );

  return result;
}
