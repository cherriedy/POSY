import { PrismaClient, TableStatus } from '@prisma/client';

export async function seedTables(prisma: PrismaClient) {
  // First, get existing floors and zones
  const floors = await prisma.floor.findMany();
  const zones = await prisma.zone.findMany();

  if (floors.length === 0) {
    console.log('⚠️  No floors found. Please seed floors first.');
    return;
  }

  if (zones.length === 0) {
    console.log('⚠️  No zones found. Please seed zones first.');
    return;
  }

  // Helper function to get random floor
  const getFloor = (name: string) => floors.find((f) => f.name === name);

  // Helper function to get random zone
  const getZone = (name: string) => zones.find((z) => z.name === name);

  const tables = [
    // Ground Floor - Main Hall
    {
      name: 'T-101',
      capacity: 4,
      floor_id: getFloor('Ground Floor')?.id,
      zone_id: getZone('Main Hall')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 100,
      pos_y: 100,
      is_active: true,
    },
    {
      name: 'T-102',
      capacity: 4,
      floor_id: getFloor('Ground Floor')?.id,
      zone_id: getZone('Main Hall')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 200,
      pos_y: 100,
      is_active: true,
    },
    {
      name: 'T-103',
      capacity: 6,
      floor_id: getFloor('Ground Floor')?.id,
      zone_id: getZone('Main Hall')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 300,
      pos_y: 100,
      is_active: true,
    },
    {
      name: 'T-104',
      capacity: 2,
      floor_id: getFloor('Ground Floor')?.id,
      zone_id: getZone('Main Hall')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 100,
      pos_y: 200,
      is_active: true,
    },
    {
      name: 'T-105',
      capacity: 4,
      floor_id: getFloor('Ground Floor')?.id,
      zone_id: getZone('Main Hall')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 200,
      pos_y: 200,
      is_active: true,
    },

    // Ground Floor - Window Seats
    {
      name: 'W-101',
      capacity: 2,
      floor_id: getFloor('Ground Floor')?.id,
      zone_id: getZone('Window Seats')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 50,
      pos_y: 50,
      is_active: true,
    },
    {
      name: 'W-102',
      capacity: 2,
      floor_id: getFloor('Ground Floor')?.id,
      zone_id: getZone('Window Seats')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 50,
      pos_y: 150,
      is_active: true,
    },
    {
      name: 'W-103',
      capacity: 2,
      floor_id: getFloor('Ground Floor')?.id,
      zone_id: getZone('Window Seats')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 50,
      pos_y: 250,
      is_active: true,
    },

    // Ground Floor - Bar Area
    {
      name: 'BAR-01',
      capacity: 1,
      floor_id: getFloor('Ground Floor')?.id,
      zone_id: getZone('Bar Area')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 400,
      pos_y: 50,
      is_active: true,
    },
    {
      name: 'BAR-02',
      capacity: 1,
      floor_id: getFloor('Ground Floor')?.id,
      zone_id: getZone('Bar Area')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 450,
      pos_y: 50,
      is_active: true,
    },
    {
      name: 'BAR-L1',
      capacity: 4,
      floor_id: getFloor('Ground Floor')?.id,
      zone_id: getZone('Bar Area')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 400,
      pos_y: 100,
      is_active: true,
    },

    // Ground Floor - Quick Service (no zone)
    {
      name: 'QS-01',
      capacity: 2,
      floor_id: getFloor('Ground Floor')?.id,
      zone_id: null,
      status: TableStatus.AVAILABLE,
      pos_x: 500,
      pos_y: 50,
      is_active: true,
    },
    {
      name: 'QS-02',
      capacity: 2,
      floor_id: getFloor('Ground Floor')?.id,
      zone_id: null,
      status: TableStatus.AVAILABLE,
      pos_x: 550,
      pos_y: 50,
      is_active: true,
    },

    // First Floor - VIP Room
    {
      name: 'VIP-01',
      capacity: 8,
      floor_id: getFloor('First Floor')?.id,
      zone_id: getZone('VIP Room')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 100,
      pos_y: 100,
      is_active: true,
    },
    {
      name: 'VIP-02',
      capacity: 6,
      floor_id: getFloor('First Floor')?.id,
      zone_id: getZone('VIP Room')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 200,
      pos_y: 100,
      is_active: true,
    },

    // First Floor - Private Room 1
    {
      name: 'PR1-01',
      capacity: 10,
      floor_id: getFloor('First Floor')?.id,
      zone_id: getZone('Private Room 1')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 100,
      pos_y: 200,
      is_active: true,
    },

    // First Floor - Private Room 2
    {
      name: 'PR2-01',
      capacity: 12,
      floor_id: getFloor('First Floor')?.id,
      zone_id: getZone('Private Room 2')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 100,
      pos_y: 300,
      is_active: true,
    },
    {
      name: 'PR2-02',
      capacity: 8,
      floor_id: getFloor('First Floor')?.id,
      zone_id: getZone('Private Room 2')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 200,
      pos_y: 300,
      is_active: true,
    },

    // First Floor - Family Section
    {
      name: 'FAM-01',
      capacity: 6,
      floor_id: getFloor('First Floor')?.id,
      zone_id: getZone('Family Section')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 300,
      pos_y: 100,
      is_active: true,
    },
    {
      name: 'FAM-02',
      capacity: 6,
      floor_id: getFloor('First Floor')?.id,
      zone_id: getZone('Family Section')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 400,
      pos_y: 100,
      is_active: true,
    },
    {
      name: 'FAM-03',
      capacity: 4,
      floor_id: getFloor('First Floor')?.id,
      zone_id: getZone('Family Section')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 300,
      pos_y: 200,
      is_active: true,
    },

    // Second Floor - Garden View
    {
      name: 'GV-01',
      capacity: 4,
      floor_id: getFloor('Second Floor')?.id,
      zone_id: getZone('Garden View')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 100,
      pos_y: 100,
      is_active: true,
    },
    {
      name: 'GV-02',
      capacity: 4,
      floor_id: getFloor('Second Floor')?.id,
      zone_id: getZone('Garden View')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 200,
      pos_y: 100,
      is_active: true,
    },
    {
      name: 'GV-03',
      capacity: 2,
      floor_id: getFloor('Second Floor')?.id,
      zone_id: getZone('Garden View')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 300,
      pos_y: 100,
      is_active: true,
    },
    {
      name: 'GV-04',
      capacity: 2,
      floor_id: getFloor('Second Floor')?.id,
      zone_id: getZone('Garden View')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 100,
      pos_y: 200,
      is_active: true,
    },

    // Rooftop - Outdoor Terrace
    {
      name: 'OT-01',
      capacity: 4,
      floor_id: getFloor('Rooftop')?.id,
      zone_id: getZone('Outdoor Terrace')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 100,
      pos_y: 100,
      is_active: true,
    },
    {
      name: 'OT-02',
      capacity: 4,
      floor_id: getFloor('Rooftop')?.id,
      zone_id: getZone('Outdoor Terrace')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 200,
      pos_y: 100,
      is_active: true,
    },
    {
      name: 'OT-03',
      capacity: 6,
      floor_id: getFloor('Rooftop')?.id,
      zone_id: getZone('Outdoor Terrace')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 300,
      pos_y: 100,
      is_active: true,
    },
    {
      name: 'OT-04',
      capacity: 2,
      floor_id: getFloor('Rooftop')?.id,
      zone_id: getZone('Outdoor Terrace')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 100,
      pos_y: 200,
      is_active: true,
    },
    {
      name: 'OT-05',
      capacity: 2,
      floor_id: getFloor('Rooftop')?.id,
      zone_id: getZone('Outdoor Terrace')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: 200,
      pos_y: 200,
      is_active: true,
    },

    // Tables with only zone (no floor assignment)
    {
      name: 'MOBILE-01',
      capacity: 4,
      floor_id: null,
      zone_id: getZone('Main Hall')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: null,
      pos_y: null,
      is_active: true,
    },
    {
      name: 'MOBILE-02',
      capacity: 2,
      floor_id: null,
      zone_id: getZone('Main Hall')?.id,
      status: TableStatus.AVAILABLE,
      pos_x: null,
      pos_y: null,
      is_active: true,
    },

    // Tables with only floor (no zone assignment)
    {
      name: 'TEMP-01',
      capacity: 4,
      floor_id: getFloor('Ground Floor')?.id,
      zone_id: null,
      status: TableStatus.AVAILABLE,
      pos_x: 600,
      pos_y: 100,
      is_active: true,
    },
    {
      name: 'TEMP-02',
      capacity: 4,
      floor_id: getFloor('Ground Floor')?.id,
      zone_id: null,
      status: TableStatus.AVAILABLE,
      pos_x: 600,
      pos_y: 200,
      is_active: true,
    },

    // Some occupied tables for variety
    {
      name: 'T-106',
      capacity: 4,
      floor_id: getFloor('Ground Floor')?.id,
      zone_id: getZone('Main Hall')?.id,
      status: TableStatus.OCCUPIED,
      pos_x: 300,
      pos_y: 200,
      is_active: true,
    },
    {
      name: 'VIP-03',
      capacity: 6,
      floor_id: getFloor('First Floor')?.id,
      zone_id: getZone('VIP Room')?.id,
      status: TableStatus.RESERVED,
      pos_x: 300,
      pos_y: 100,
      is_active: true,
    },
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const table of tables) {
    // Check if table with same name and floor already exists
    const exists = await prisma.table.findFirst({
      where: {
        name: table.name,
        floor_id: table.floor_id,
      },
    });

    if (!exists) {
      await prisma.table.create({ data: table });
      createdCount++;
    } else {
      skippedCount++;
    }
  }

  console.log(`Tables seeded successfully`);
  console.log(`   - Created: ${createdCount} tables`);
  console.log(`   - Skipped: ${skippedCount} tables (already exist)`);
  console.log(`   - Total: ${tables.length} tables processed`);
}
