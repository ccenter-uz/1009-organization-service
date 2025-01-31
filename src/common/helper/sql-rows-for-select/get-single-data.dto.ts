import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export async function getSingleData(
  CapitalizaName: string,
  name: string,
  prisma: PrismaService,
  data: any,
  conditions?: Prisma.Sql[],
  pagination?: { take: number; skip: number }
) {
  const whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  const result: any = await prisma.$queryRaw(
    Prisma.sql`
        WITH
            ${Prisma.raw(CapitalizaName)}Translations AS (
                SELECT
                    ct.${Prisma.raw(`${name}_id`)},
                    JSON_AGG(
                        JSONB_BUILD_OBJECT(
                            'languageCode', ct.language_code,
                            'name', ct.name
                        )
                    )::JSONB AS Translations  
                FROM ${Prisma.raw(name + (name === 'phone_types' ? '_id_translations' : '_translations'))} ct
                WHERE (${data.allLang} = TRUE OR 
                    ${data.langCode ? Prisma.sql`ct.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
                GROUP BY ct.${Prisma.raw(`${name}_id`)}
            )
        SELECT
            c.*,  
            (SELECT Translations FROM ${Prisma.raw(CapitalizaName)}Translations WHERE ${Prisma.raw(`${name}_id`)} = c.id) AS "${Prisma.raw(CapitalizaName)}Translations"
        FROM
            ${Prisma.raw(name)} c
        ${whereClause}
        GROUP BY 
            c.id
        ORDER BY
            (
                SELECT jsonb_extract_path_text(
                    Translations::jsonb->0, 'name'
                )
                FROM ${Prisma.raw(CapitalizaName)}Translations
                WHERE ${Prisma.raw(`${name}_id`)} = c.id
            ) ASC
        ${pagination ? Prisma.sql`LIMIT ${pagination.take} OFFSET ${pagination.skip}` : Prisma.empty}
    `
  );
  return result;
}
