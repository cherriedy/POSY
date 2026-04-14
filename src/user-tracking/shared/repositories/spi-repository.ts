import { SessionProductInteractionRepository } from './spi-repository.abstract';
import { SessionProductInteraction } from '../entities';
import { PrismaService } from '../../../providers/prisma/prisma.service';

export class SessionProductInteractionRepositoryImpl implements SessionProductInteractionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async bulkUpsert<U = void>(
    entities: SessionProductInteraction[],
  ): Promise<U> {
    if (entities.length === 0) {
      return undefined as U;
    }

    const result = await this.prismaService.$transaction(
      entities.map((entity) => {
        return this.prismaService.sessionProductInteraction.upsert({
          where: {
            session_id_product_id: {
              session_id: entity.sessionId,
              product_id: entity.productId,
            },
          },
          create: {
            session_id: entity.sessionId,
            product_id: entity.productId,
            view_count: entity.viewCount,
            order_count: entity.orderCount,
            total_quantity: entity.totalQuantity,
            total_spent: entity.totalSpent,
            interaction_score: entity.interactionScore,
          },
          update: {
            view_count: { increment: entity.viewCount },
            order_count: { increment: entity.orderCount },
            total_quantity: { increment: entity.totalQuantity },
            total_spent: { increment: entity.totalSpent },
            interaction_score: entity.interactionScore,
          },
        });
      }),
    );

    return result as U;
  }
}
