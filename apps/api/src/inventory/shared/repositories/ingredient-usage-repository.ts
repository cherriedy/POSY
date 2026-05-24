import { Injectable } from '@nestjs/common';
import { IngredientUsage } from '@prisma/client';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { IngredientUsageRepository } from './ingredient-usage-repository.abstract';

@Injectable()
export class IngredientUsageRepositoryImpl implements IngredientUsageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByIngredientAndDateRange(
    ingredientId: string,
    from: Date,
    to: Date,
  ): Promise<IngredientUsage[]> {
    return this.prismaService.ingredientUsage.findMany({
      where: {
        ingredient_id: ingredientId,
        usage_date: { gte: from, lte: to },
      },
      orderBy: { usage_date: 'asc' },
    });
  }
}
