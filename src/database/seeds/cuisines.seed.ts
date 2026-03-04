import { PrismaClient } from '@prisma/client';

const CUISINES: { name: string; region: string }[] = [
  { name: 'Vietnamese', region: 'Southeast Asia' },
  { name: 'Thai', region: 'Southeast Asia' },
  { name: 'Japanese', region: 'East Asia' },
  { name: 'Chinese', region: 'East Asia' },
  { name: 'Korean', region: 'East Asia' },
  { name: 'Indian', region: 'South Asia' },
  { name: 'Italian', region: 'Mediterranean' },
  { name: 'French', region: 'Western Europe' },
  { name: 'Mexican', region: 'Latin America' },
  { name: 'American', region: 'North America' },
  { name: 'Mediterranean', region: 'Mediterranean' },
  { name: 'Middle Eastern', region: 'Middle East' },
  { name: 'Spanish', region: 'Western Europe' },
  { name: 'Greek', region: 'Mediterranean' },
  { name: 'Indonesian', region: 'Southeast Asia' },
  { name: 'Malaysian', region: 'Southeast Asia' },
  { name: 'Filipino', region: 'Southeast Asia' },
  { name: 'Brazilian', region: 'Latin America' },
  { name: 'Turkish', region: 'Middle East' },
  { name: 'Fusion', region: 'International' },
];

export async function seedCuisines(prisma: PrismaClient): Promise<void> {
  for (const cuisine of CUISINES) {
    await prisma.cuisine.upsert({
      where: { name: cuisine.name },
      create: {
        name: cuisine.name,
        region: cuisine.region,
        is_deleted: false,
      },
      update: {
        region: cuisine.region,
        is_deleted: false,
      },
    });
  }
}
