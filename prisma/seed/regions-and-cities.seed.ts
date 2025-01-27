import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedRegionsAndCities() {
  const regions = []; // from types

  for (const region of regions) {
    const existingRegion = await prisma.regionTranslations.findFirst({
      where: { name: region.name.ru },
    });

    if (!existingRegion) {
      const createdRegion = await prisma.region.create({
        data: {
          RegionTranslations: {
            create: [
              { languageCode: 'ru', name: region.name.ru },
              { languageCode: 'uz', name: region.name.uz },
              { languageCode: 'cy', name: region.name.cy },
            ],
          },
        },
      });

      console.log(`Region created: ${region.name.ru}`);

      for (const city of region.cities) {
        await prisma.city.create({
          data: {
            regionId: createdRegion.id,
            CityTranslations: {
              create: [
                { languageCode: 'ru', name: city.name.ru },
                { languageCode: 'uz', name: city.name.uz },
                { languageCode: 'cy', name: city.name.cy },
              ],
            },
          },
        });
        console.log(`City created: ${city.name.ru}`);
      }
    } else {
      console.log(`Region already exists: ${region.name.ru}`);
    }
  }
}
