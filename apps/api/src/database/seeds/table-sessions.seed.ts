import { faker } from '@faker-js/faker';
import {
  PrismaClient,
  TableSessionStatus,
  TableSessionType,
} from '@prisma/client';

export async function seedTableSessions(prisma: PrismaClient) {
  // Fetch all tables and at least one staff user
  const tables = await prisma.table.findMany({
    where: { is_active: true },
    select: { id: true },
  });

  const staff = await prisma.user.findFirst({
    where: { role: 'STAFF' },
    select: { id: true },
  });

  if (!tables.length) {
    throw new Error('No active tables found. Seed tables first.');
  }

  if (!staff) {
    throw new Error('No staff user found. Seed staff first.');
  }

  // Generate session tokens
  const generateSessionToken = () => {
    return faker.string.alphanumeric(128);
  };

  const generateDeviceFingerprint = () => {
    return faker.string.alphanumeric(256);
  };

  // Create 10-15 table sessions
  const sessionCount = faker.number.int({ min: 10, max: 15 });
  const now = new Date();

  for (let i = 0; i < sessionCount; i++) {
    const table = faker.helpers.arrayElement(tables);
    const status = faker.helpers.arrayElement([
      TableSessionStatus.ACTIVE,
      TableSessionStatus.COMPLETED,
    ]);
    const sessionType = faker.helpers.arrayElement([
      TableSessionType.GUEST,
      TableSessionType.STAFF,
    ]);

    // For completed sessions, set end_at to some time after start_at
    const startAt = faker.date.recent({ days: 7 });
    const endAt =
      status === TableSessionStatus.COMPLETED
        ? new Date(
            startAt.getTime() + faker.number.int({ min: 900000, max: 5400000 }),
          )
        : undefined;

    // Expires at is 24 hours from now for active, or shortly after end_at for completed
    const expiresAt =
      status === TableSessionStatus.COMPLETED
        ? new Date(endAt!.getTime() + 3600000)
        : new Date(now.getTime() + 86400000);

    const sessionToken = generateSessionToken();
    let retries = 0;

    // Ensure unique session token
    while (retries < 5) {
      const exists = await prisma.tableSession.findUnique({
        where: { session_token: sessionToken },
      });

      if (!exists) {
        break;
      }
      retries++;
    }

    if (retries >= 5) {
      continue; // Skip this session if we can't generate unique token
    }

    const tableSessionExists = await prisma.tableSession.findFirst({
      where: {
        table_id: table.id,
        status: TableSessionStatus.ACTIVE,
        start_at: {
          gte: new Date(now.getTime() - 86400000), // Within last 24 hours
        },
      },
    });

    // Skip if table already has an active session
    if (tableSessionExists) {
      continue;
    }

    await prisma.tableSession.create({
      data: {
        table_id: table.id,
        user_id: sessionType === TableSessionType.STAFF ? staff.id : null,
        session_token: sessionToken,
        device_fingerprint: generateDeviceFingerprint(),
        status: status,
        session_type: sessionType,
        start_at: startAt,
        end_at: endAt,
        expires_at: expiresAt,
      },
    });
  }
}
