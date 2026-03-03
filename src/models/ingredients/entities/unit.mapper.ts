import { Unit } from './unit.class';
import { Unit as PrismaUnit } from '@prisma/client';

export class UnitMapper {
  static toDomain(prisma: PrismaUnit): Unit {
    return new Unit(
      prisma.id,
      prisma.name,
      prisma.abbreviation,
      prisma.created_at,
      prisma.updated_at,
    );
  }

  static toPrisma(domain: Unit): Partial<PrismaUnit> {
    return {
      id: domain.id ?? undefined,
      name: domain.name,
      abbreviation: domain.abbreviation,
    };
  }
}
