import { PrismaClient } from '@prisma/client';

export async function seedFloors(prisma: PrismaClient) {
  const floors = [
    {
      name: 'Ground Floor',
      order: 0,
      is_active: true,
    },
    {
      name: 'First Floor',
      order: 1,
      is_active: true,
    },
    {
      name: 'Second Floor',
      order: 2,
      is_active: true,
    },
    {
      name: 'Basement',
      order: -1,
      is_active: true,
    },
    {
      name: 'Rooftop',
      order: 3,
      is_active: true,
    },
  ];

  for (const floor of floors) {
    const exists = await prisma.floor.findUnique({
      where: { name: floor.name },
    });
    if (!exists) {
      await prisma.floor.create({ data: floor });
    }
  }

  console.log('Floors seeded successfully');
}
