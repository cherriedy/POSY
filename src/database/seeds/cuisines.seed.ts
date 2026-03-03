import { PrismaClient } from '@prisma/client';

export async function seedCuisines(prisma: PrismaClient) {
  const cuisines = [
    { name: 'Vietnamese', region: 'Southeast Asia' },
    { name: 'Thai', region: 'Southeast Asia' },
    { name: 'Japanese', region: 'East Asia' },
    { name: 'Korean', region: 'East Asia' },
    { name: 'Chinese', region: 'East Asia' },
    { name: 'Italian', region: 'Mediterranean' },
    { name: 'French', region: 'Western Europe' },
    { name: 'American', region: 'North America' },
    { name: 'Mexican', region: 'Latin America' },
    { name: 'Indian', region: 'South Asia' },
  ];

  for (const cuisine of cuisines) {
    const exists = await prisma.cuisine.findFirst({
      where: {
        name: cuisine.name,
        is_deleted: false,
      },
    });

    if (!exists) {
      await prisma.cuisine.create({
        data: {
          name: cuisine.name,
          region: cuisine.region,
        },
      });
    }
  }
}