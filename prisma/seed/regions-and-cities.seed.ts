import { PrismaClient } from '@prisma/client';
import { LanguageRequestEnum } from '../../types/global';
import { RegionsAndCities } from '../../types/seed';

const prisma = new PrismaClient();

export async function seedRegionsAndCities() {
  const regions = RegionsAndCities;
  let counterRegion = 0;
  let counterCity = 0;

  for (const region of regions) {
    const existingRegion = await prisma.regionTranslations.findFirst({
      where: { name: region.name.ru },
    });

    let regionId: number;

    if (!existingRegion) {
      console.log(`Creating region: ${region.name.ru}`);

      const createdRegion = await prisma.region.create({
        data: {
          RegionTranslations: {
            create: [
              { languageCode: LanguageRequestEnum.RU, name: region.name.ru },
              { languageCode: LanguageRequestEnum.UZ, name: region.name.uz },
              { languageCode: LanguageRequestEnum.CY, name: region.name.cy },
            ],
          },
        },
      });

      regionId = createdRegion.id;
      counterRegion++;
    } else {
      console.log(`Region '${region.name.ru}' already exists.`);
      regionId = existingRegion.regionId;
    }

    for (const city of region.cities) {
      const existingCity = await prisma.cityTranslations.findFirst({
        where: {
          name: city?.name?.ru,
        },
      });

      if (!existingCity) {
        console.log(
          `Adding new city '${city.name.ru}' to region '${region.name.ru}'`
        );
        await prisma.city.create({
          data: {
            regionId: regionId,
            CityTranslations: {
              create: [
                { languageCode: LanguageRequestEnum.RU, name: city.name.ru },
                { languageCode: LanguageRequestEnum.UZ, name: city.name.uz },
                { languageCode: LanguageRequestEnum.CY, name: city.name.cy },
              ],
            },
          },
        });

        counterCity++;
      } else {
        console.log(
          `City '${city.name.ru}' already exists in region '${region.name.ru}'.`
        );
      }
    }
  }

  console.log(`Total created Region: ${counterRegion}`);
  console.log(`Total created City: ${counterCity}`);
}
