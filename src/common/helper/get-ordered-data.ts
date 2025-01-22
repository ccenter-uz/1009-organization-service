import { Prisma } from '@prisma/client';

export async function getOrderedData(
  prisma,
  data,
  conditions,
  pagination
) {
  const whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  const categories: any = await prisma.$queryRaw(
    Prisma.sql`
          SELECT
          c.*,  -- Все поля из таблицы категории
          JSON_AGG(  -- Агрегируем переводы категории
              JSONB_BUILD_OBJECT(
                  'languageCode', ct.language_code,
                  'name', ct.name
              )
          ) AS "CategoryTranslations",
          
      -- Преобразуем весь объект города в JSONB
        JSONB_SET(
            ROW_TO_JSON(city)::JSONB, 
            '{CityTranslations}',  -- Добавляем ключ для переводов
            (
                SELECT JSON_AGG(  -- Получаем все переводы города
                    JSONB_BUILD_OBJECT(
                      'languageCode', cyt.language_code,
                      'name', cyt.name
                  )
              )
              FROM city_translations cyt
              WHERE cyt.city_id = city.id
                AND (${data.allLang} = TRUE OR 
                     ${data.langCode ? Prisma.sql`cyt.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
          )::JSONB
        ) || JSONB_BUILD_OBJECT(  -- Добавляем данные о регионе
            'Region', JSONB_SET(
                ROW_TO_JSON(region)::JSONB,  -- Преобразуем весь объект региона в JSONB
                '{RegionTranslations}',  -- Добавляем ключ для переводов
                (
                  SELECT JSON_AGG(  -- Получаем все переводы региона
                      JSONB_BUILD_OBJECT(
                          'languageCode', rt.language_code,
                          'name', rt.name
                      )
                   )
                  FROM region_translations rt
                  WHERE rt.region_id = region.id
                    AND (${data.allLang} = TRUE OR 
                         ${data.langCode ? Prisma.sql`rt.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
                      )::JSONB
                  )
              ) AS City
            FROM
              category c
            LEFT JOIN
              category_translations ct ON c.id = ct.category_id
              ${data.langCode ? Prisma.sql`AND ct.language_code = ${data.langCode}` : Prisma.empty}
            LEFT JOIN
              city ON c.city_id = city.id
            LEFT JOIN
              region ON city.region_id = region.id
            ${whereClause}
            GROUP BY
              c.id, city.id, region.id
  
            ORDER BY
              (
                  SELECT jsonb_extract_path_text(
                      (JSON_AGG(
                          JSONB_BUILD_OBJECT(
                              'languageCode', ct.language_code,
                              'name', ct.name
                          )
                      ))::jsonb->0, 'name'
                  )
                  FROM category_translations ct
                  WHERE ct.category_id = c.id 
                    AND (${data.allLang} = TRUE OR 
                          ${data.langCode ? Prisma.sql`ct.language_code = ${data.langCode}` : Prisma.sql`TRUE`})
                  LIMIT 1
              ) ASC
  
            LIMIT ${pagination.take}
            OFFSET ${pagination.skip};
            `
  );

  return categories;
}
