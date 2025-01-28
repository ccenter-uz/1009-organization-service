import { seedRegionsAndCities } from './regions-and-cities.seed';

async function main() {
  seedRegionsAndCities();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Seeding complete!');
  });
