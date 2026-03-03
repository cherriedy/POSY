import { PrismaClient } from '@prisma/client';

const UNITS = [
  { name: 'Kilogram', abbreviation: 'kg' },
  { name: 'Gram', abbreviation: 'g' },
  { name: 'Liter', abbreviation: 'L' },
  { name: 'Milliliter', abbreviation: 'mL' },
  { name: 'Piece', abbreviation: 'pcs' },
  { name: 'Dozen', abbreviation: 'doz' },
  { name: 'Tablespoon', abbreviation: 'tbsp' },
  { name: 'Teaspoon', abbreviation: 'tsp' },
];

export async function seedUnits(prisma: PrismaClient) {
  const createdUnits = await Promise.all(
    UNITS.map((unit) =>
      prisma.unit.upsert({
        where: { name: unit.name },
        update: {},
        create: unit,
      }),
    ),
  );
  console.log(`Seeded ${createdUnits.length} units.`);
  return createdUnits;
}
