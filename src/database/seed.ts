import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import {
  seedAdmin,
  seedCategories,
  seedFloors,
  seedProducts,
  seedPromotions,
  seedStaff,
  seedTables,
  seedTaxes,
  seedZones,
} from './seeds';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await seedAdmin(prisma);
  await seedStaff(prisma);
  await seedCategories(prisma);
  await seedPromotions(prisma);
  await seedProducts(prisma);
  await seedZones(prisma);
  await seedFloors(prisma);
  await seedTables(prisma);
  await seedTaxes(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
