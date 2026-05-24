import { faker } from '@faker-js/faker';
import { PrismaClient, VendorStatus } from '@prisma/client';

export async function seedVendors(prisma: PrismaClient) {
  const vendors = Array.from({ length: 5 }).map(() => ({
    name: faker.company.name(),
    contact_name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.string.numeric(10),
    address: faker.location.streetAddress(),
    tax_code: faker.string.alphanumeric(10).toUpperCase(),
    payment_term: faker.helpers.arrayElement([7, 14, 30, 60]),
    note: faker.lorem.sentence(),
    status: VendorStatus.ACTIVE,
  }));

  const createdVendors = await Promise.all(
    vendors.map((vendor) => prisma.vendor.create({ data: vendor })),
  );
  console.log(`Seeded ${createdVendors.length} vendors.`);
  return createdVendors;
}
