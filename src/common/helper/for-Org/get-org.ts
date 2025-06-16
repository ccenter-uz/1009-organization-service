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

  whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  const result = await prisma.$queryRaw(Prisma.sql`
      SELECT 
        o.name, 
        o.address, 
        o.status, 
        o.created_at AS "createdAt"
      FROM organization o 
      ${whereClause}
    `);

  return result;
}
