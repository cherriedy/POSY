import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import {
  seedAdmin,
  seedCategories,
  seedFloors,
  seedZones,
  seedIngredients,
  seedProducts,
  seedPromotions,
  seedStaff,
  seedTables,
  seedTaxes,
  seedCuisines,
  seedTableSessions,
  seedOrders,
  seedOrderItems,
  seedPaymentMethods,
  seedCompletedOrders,
  seedSessionProductInteractions,
} from './seeds';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('Starting seeds...');
    console.log('Seeding admin...');
    await seedAdmin(prisma);
    console.log('Seeding staff...');
    await seedStaff(prisma);
    console.log('Seeding categories...');
    await seedCategories(prisma);
    console.log('Seeding cuisines...');
    await seedCuisines(prisma);
    console.log('Seeding promotions...');
    await seedPromotions(prisma);
    console.log('Seeding ingredients...');
    await seedIngredients(prisma);
    console.log('Seeding products...');
    await seedProducts(prisma);
    console.log('Seeding floors...');
    await seedFloors(prisma);
    console.log('Seeding zones...');
    await seedZones(prisma);
    console.log('Seeding tables...');
    await seedTables(prisma);
    console.log('Seeding taxes...');
    await seedTaxes(prisma);
    console.log('Seeding payment methods...');
    await seedPaymentMethods(prisma);
    console.log('Seeding table sessions...');
    await seedTableSessions(prisma);
    console.log('Seeding orders...');
    await seedOrders(prisma);
    console.log('Seeding order items...');
    await seedOrderItems(prisma);
    console.log('Seeding completed orders...');
    await seedCompletedOrders(prisma);
    console.log('Seeding session product interactions...');
    await seedSessionProductInteractions(prisma);
    console.log('All seeds completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
