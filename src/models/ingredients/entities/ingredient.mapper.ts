import { Ingredient } from './ingredient.class';
import { Ingredient as PrismaIngredient, Prisma } from '@prisma/client';
import { UnitMapper } from '../../units';
import { VendorMapper } from '../../vendors';

export class IngredientMapper {
  static toDomain(this: void, prisma: PrismaIngredient): Ingredient {
    return new Ingredient(
      prisma.id,
      prisma.vendor_id,
      prisma.unit_id,
      prisma.name,
      prisma.stock,
      prisma.min_stock,
      Number(prisma.unit_cost),
      prisma.expired_at,
      prisma.created_at,
      prisma.updated_at,
      // Relations
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).vendor
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          VendorMapper.toDomain((prisma as any).vendor)
        : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).unit
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          UnitMapper.toDomain((prisma as any).unit)
        : null,
    );
  }

  static toPrisma(domain: Ingredient): Prisma.IngredientUncheckedCreateInput {
    return {
      id: domain.id ?? undefined,
      vendor_id: domain.vendorId,
      unit_id: domain.unitId,
      name: domain.name,
      stock: domain.stock,
      min_stock: domain.minStock,
      unit_cost: new Prisma.Decimal(domain.unitCost),
      expired_at: domain.expiredAt,
    };
  }
}
