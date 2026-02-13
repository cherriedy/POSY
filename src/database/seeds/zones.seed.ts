import { PrismaClient } from '@prisma/client';

export async function seedZones(prisma: PrismaClient) {
  const zones = [
    {
      name: 'Main Hall',
      description: 'Main dining area with spacious seating',
      is_active: true,
    },
    {
      name: 'VIP Room',
      description: 'Private VIP dining room for special occasions',
      is_active: true,
    },
    {
      name: 'Outdoor Terrace',
      description: 'Open-air terrace with garden view',
      is_active: true,
    },
    {
      name: 'Bar Area',
      description: 'Bar counter and lounge seating',
      is_active: true,
    },
    {
      name: 'Private Room 1',
      description: 'Small private dining room for groups',
      is_active: true,
    },
    {
      name: 'Private Room 2',
      description: 'Medium private dining room for events',
      is_active: true,
    },
    {
      name: 'Window Seats',
      description: 'Window-side seating with street view',
      is_active: true,
    },
    {
      name: 'Garden View',
      description: 'Indoor seating area overlooking the garden',
      is_active: true,
    },
    {
      name: 'Quick Service',
      description: 'Fast service counter area for takeaway and quick dining',
      is_active: true,
    },
    {
      name: 'Family Section',
      description: 'Family-friendly area with high chairs available',
      is_active: true,
    },
  ];

  for (const zone of zones) {
    const exists = await prisma.zone.findUnique({
      where: { name: zone.name },
    });
    if (!exists) {
      await prisma.zone.create({ data: zone });
    }
  }
}
