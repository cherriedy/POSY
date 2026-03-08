import { PrismaClient, TableStatus } from '@prisma/client';

export async function seedTables(prisma: PrismaClient) {
  const zones = await prisma.zone.findMany({
    where: { is_active: true },
  });

  for (const zone of zones) {
    for (let i = 1; i <= 5; i++) {
      const tableName = `${zone.name}-T${i}`;

      const exists = await prisma.table.findFirst({
        where: {
          name: tableName,
          zone_id: zone.id,
        },
      });

      if (!exists) {
        await prisma.table.create({
          data: {
            name: tableName,
            capacity: 4,
            status: TableStatus.AVAILABLE,
            zone: {
              connect: { id: zone.id },
            },
          },
        });
      }
    }
  }
}
