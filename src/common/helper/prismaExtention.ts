import { PrismaClient } from '@prisma/client';

const orgPrismaExtension = new PrismaClient().$extends({
  name: 'organizationExtension',
  model: {
    organization: {
      async createAndVersion(data: any) {
        return await orgPrismaExtension.$transaction(async (tx) => {
          await tx.organization.createMany({
            data,
            skipDuplicates: true,
          });

          const orgs = await tx.organization.findMany({
            where: {
              OR: data.map((item: any) => ({
                clientId: item.clientId,
              })),
            },
          });

          const orgsVersion = orgs.map((item) => ({
            ...item,
            organizationId: item.id,
          }));

          await tx.organizationVersion.createMany({
            data: orgsVersion,
            skipDuplicates: true,
          });
        });
      },
    },
  },
});

export default orgPrismaExtension;
