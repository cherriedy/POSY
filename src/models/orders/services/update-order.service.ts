import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { OrderUpdateRequestDto } from '../shared';
import { OrderItemStatus, OrderNotFoundForSessionException } from '../shared';
import { Order, OrderItem } from '../shared';
import { GuestOrderGateway } from '../handlers/guest-order.gateway';
import { AtLeastOneItemRequiredException } from '../../../common/exceptions';
import { ProductRepository } from '../../products/repositories/product-repository.abstract';
import { ProductNotFoundException } from '../../products';
import { OrderPricingService } from '../shared/core/services/order-pricing.service';
import { OrderModificationPolicyService } from '../shared/core/services/order-modification-policy.service';
import { OrderRepository } from '../shared/repositories/order-repository.abstract';
import { OrderItemRepository } from '../shared/repositories/order-item-repository.abstract';
import { UserIdentity } from '../../../authentication/interfaces';
import { computeOrderStatus } from '../shared/utilities';
@Injectable()
export class UpdateOrderService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly productRepository: ProductRepository,
    private readonly orderModificationPolicy: OrderModificationPolicyService,
    private readonly guestOrderGateway: GuestOrderGateway,
    private readonly orderPricingService: OrderPricingService,
  ) { }

  async execute(
    sessionId: string,
    dto: OrderUpdateRequestDto,
    user?: UserIdentity,
  ): Promise<Order> {
    const existing = await this.orderRepository.findBySessionId(sessionId);
    if (!existing) throw new OrderNotFoundForSessionException(sessionId);

    // Delegate policy checks to a reusable service
    this.orderModificationPolicy.assertOrderModifiable(existing, user);

    if (dto.add?.length) {
      await Promise.all(
        dto.add.map(async (item) => {
          const product = await this.productRepository.findById(item.productId);
          if (!product) throw new ProductNotFoundException(item.productId);
          return new OrderItem(
            null,
            existing.id!,
            item.productId,
            item.quantity,
            product.price,
            item.quantity * product.price,
            item.note || null,
            OrderItemStatus.WAITING,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
          );
        }),
      ).then(async (newItems) => {
        await this.orderItemRepository.bulkCreate(newItems);
      });
    }

    if (dto.update?.length) {
      await Promise.all(
        dto.update.map(async (item) => {
          await this.orderItemRepository
            .findById(item.orderItemId)
            .then((existing) => {
              if (existing) {
                if (item.quantity) existing.quantity = item.quantity;
                if (item.note) existing.note = item.note;
                existing.subtotal = existing.quantity * existing.unitPrice;
                return this.orderItemRepository.update(existing.id!, existing);
              }
            });
        }),
      );
    }

    if (dto.remove?.length) {
      // Load items requested for removal to validate their current status.
      const itemsToRemove = await Promise.all(
        dto.remove.map((r) => this.orderItemRepository.findById(r.orderItemId)),
      ).then((items) =>
        // Filter out any nulls, we will handle missing items in the deletion step.
        items.filter((it): it is NonNullable<typeof it> => it != null),
      );

      // Validate removals through the centralized policy
      this.orderModificationPolicy.assertItemsRemovable(itemsToRemove, user);

      await Promise.all(
        itemsToRemove.map((it) =>
          this.orderItemRepository.update(it.id!, {
            status: OrderItemStatus.CANCELLED,
          }),
        ),
      );
    }

    if (dto.note) existing.note = dto.note; // Update order-level note if provided

    const updatedOrderItems = await this.orderItemRepository.findByOrderId(existing.id!);

    if (updatedOrderItems.length === 0) {
      throw new AtLeastOneItemRequiredException();
    }

    // recompute status
    const newStatus = computeOrderStatus(
      updatedOrderItems.map((i) => i.status),
    );

    // pricing
    const pricing = await this.orderPricingService.recomputeAndPersistPricing(
      existing,
      updatedOrderItems,
    );

    existing.subtotalAmount = pricing.subtotal;
    existing.totalAmount = pricing.totalAmount;
    existing.status = newStatus;

    const updated = await this.orderRepository.update(existing.id!, existing);
    this.guestOrderGateway.emitOrderUpdated(updated.tableId, updated.id!);
    return updated;
  }
}
