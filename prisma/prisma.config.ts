import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || 'postgresql://pos:12345@localhost:5432/posdb',
});

export const prisma = new PrismaClient({
  adapter,
});
