import {
  Prisma,
  SessionProductInteraction as PrismaSessionProductInteraction,
} from '@prisma/client';
import { SessionProductInteraction as DomainSessionProductInteraction } from './session-product-interaction';
import { MissingRequireFieldsException } from '../../common/exceptions';
import { ProductMapper } from '../../models/products/types';
import { TableSessionMapper } from '../../models/table-sessions/types';

export class SessionProductInteractionMapper {
  static toDomain(
    this: void,
    prisma: PrismaSessionProductInteraction,
  ): DomainSessionProductInteraction {
    return new DomainSessionProductInteraction(
      prisma.id,
      prisma.session_id,
      prisma.product_id,
      prisma.view_count,
      prisma.order_count,
      prisma.total_quantity,
      prisma.total_spent !== null && prisma.total_spent !== undefined
        ? Number(prisma.total_spent)
        : 0,
      prisma.interaction_score !== null &&
        prisma.interaction_score !== undefined
        ? Number(prisma.interaction_score)
        : 0,
      prisma.created_at,
      prisma.updated_at,
      // Relations
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).product
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          ProductMapper.toDomain((prisma as any).product)
        : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).session
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          TableSessionMapper.toDomain((prisma as any).session)
        : null,
    );
  }

  static toPrisma(
    this: void,
    domain: DomainSessionProductInteraction,
  ): Partial<PrismaSessionProductInteraction> {
    if (!domain.sessionId || !domain.productId) {
      throw new MissingRequireFieldsException(['sessionId', 'productId']);
    }

    return {
      session_id: domain.sessionId,
      product_id: domain.productId,
      view_count: domain.viewCount ?? 0,
      order_count: domain.orderCount ?? 0,
      total_quantity: domain.totalQuantity ?? 0,
      total_spent:
        domain.totalSpent !== null && domain.totalSpent !== undefined
          ? new Prisma.Decimal(domain.totalSpent)
          : new Prisma.Decimal(0),
      interaction_score:
        domain.interactionScore !== null &&
        domain.interactionScore !== undefined
          ? new Prisma.Decimal(domain.interactionScore)
          : new Prisma.Decimal(0),
      created_at: domain.createdAt ?? new Date(),
      updated_at: domain.updatedAt ?? new Date(),
      ...(domain.id ? { id: domain.id } : {}),
    };
  }
}
