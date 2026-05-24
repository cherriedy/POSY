import { PrismaClient, TableStatus } from '@prisma/client';
import { generateBase64UrlToken } from '../../common/utilities/string.util';
import { randomBytes } from 'crypto';

export async function seedTables(prisma: PrismaClient) {
  const zones = await prisma.zone.findMany({
    where: { is_active: true },
  });

  // Backfill existing tables that don't have a hardware_id or current_token yet
  // const tablesToBackfill = await prisma.table.findMany({
  //   where: { OR: [{ hardware_id: null }, { current_token: null }] },
  //   select: { id: true },
  // });
  //
  // for (const t of tablesToBackfill) {
  //   const hardware_id = await generateUniqueMac(prisma);
  //   const current_token = generateBase64UrlToken(9);
  //   await prisma.table.update({
  //     where: { id: t.id },
  //     data: { hardware_id, current_token },
  //   });
  // }
  //
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
            hardware_id: await generateUniqueMac(prisma),
            current_token: generateBase64UrlToken(9),
            zone: {
              connect: { id: zone.id },
            },
          },
        });
      }
    }
  }
}

/**
 * Generate a random MAC address string (locally administered) like '02:ab:cd:ef:01:23'
 */
function generateMac(): string {
  const buf = randomBytes(6);
  // set the locally administered bit and unset multicast bit on first octet
  buf[0] = (buf[0] & 0b11111110) | 0b00000010;
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(':');
}

async function generateUniqueMac(prisma: PrismaClient) {
  for (let i = 0; i < 20; i++) {
    const mac = generateMac();
    const existing = await prisma.table.findFirst({
      where: { hardware_id: mac },
      select: { id: true },
    });
    if (!existing) return mac;
  }
  // fallback loop in case of collision
  while (true) {
    const mac = generateMac();
    const existing = await prisma.table.findFirst({
      where: { hardware_id: mac },
      select: { id: true },
    });
    if (!existing) return mac;
  }
}
