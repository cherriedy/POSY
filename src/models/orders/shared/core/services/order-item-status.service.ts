import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { OrderItemStatus } from '../../enums';
import { Order } from '../../entities';
import { OrderModificationPolicyService } from './order-modification-policy.service';
import { computeOrderStatus } from '../../utilities';
import { OrderPricingService } from './order-pricing.service';
import { UserIdentity } from '../../../../../authentication/interfaces';
import {
  OrderItemNotFoundException,
  OrderModificationForbiddenException,
} from '../../exceptions';
import { ReserveIngredientsService } from './reserve-ingredients.service';
import { OrderItemRepository } from '../../repositories/order-item-repository.abstract';
import { OrderRepository } from '../../repositories/order-repository.abstract';
import { UnitOfWork } from '../../../../../common/unit-of-works';

@Injectable()
export class OrderItemStatusService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(
    private readonly uow: UnitOfWork,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly orderRepository: OrderRepository,
    private readonly orderModificationPolicy: OrderModificationPolicyService,
    private readonly reserveIngredientsService: ReserveIngredientsService,
    private readonly orderPricingService: OrderPricingService,
  ) {}

  /**
   * Updates the status of a specific order item and recomputes the overall order status.
   *
   * @param params - An object containing the order ID, item ID, new status, and an optional note.
   *
   * @note This method enforces the following rules:
   * - Only items in WAITING or PREPARING status can be updated.
   * - When an item transitions from WAITING to PREPARING, the required ingredients are reserved.
   * - If an item is canceled while in PREPARING status, any reserved ingredients are rolled back.
   * - After updating the item status, the overall order status is recomputed based on the statuses of all items.
   *
   * @returns The updated Order with the new item status and recomputed order status.
   * @throws OrderItemNotFoundException if the specified order item does not exist.
   * @throws OrderModificationForbiddenException if the item status change is not allowed based on current status.
   */
  async execute(params: {
    orderId: string;
    itemId: string;
    status: OrderItemStatus;
    note?: string | null;
    user?: UserIdentity;
  }): Promise<Order> {
    const { orderId, itemId, status } = params;

    return await this.uow.execute!(async () => {
      const orderItem = await this.orderItemRepository
        .findByOrderIdAndItemId(orderId, itemId)
        .catch((e: Error) => {
          this.logger.error(
            `Failed to find order item ${itemId} in order ${orderId}`,
            e.stack,
          );
          return null;
        });
      if (!orderItem)
        throw new OrderItemNotFoundException(
          itemId,
          `Order item ${itemId} not found in order ${orderId}`,
        );

      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        this.logger.error(`Order ${orderId} not found for policy checks.`);
        throw new OrderModificationForbiddenException('Order not found.');
      }

      if (params.user) {
        // Assert order-level modifiability rules before allowing item status change
        this.orderModificationPolicy.assertOrderModifiable(order, params.user);
        // Assert item-level modifiability rules before allowing item status change
        this.orderModificationPolicy.assertItemModifiable(status, params.user);
      }

      // Ensure current item status allows transition
      if (
        orderItem.status !== OrderItemStatus.WAITING &&
        orderItem.status !== OrderItemStatus.PREPARING
      ) {
        throw new OrderModificationForbiddenException(
          `Cannot change status of an item that is already ${orderItem.status}.`,
        );
      }

      const prevStatus: OrderItemStatus = orderItem.status;

      // Reserve when an item moves from WAITING -> PREPARING
      if (
        prevStatus === OrderItemStatus.WAITING &&
        status === OrderItemStatus.PREPARING
      ) {
        await this.reserveIngredientsService.reserve(
          orderItem.productId,
          orderItem.quantity,
        );
      }

      // Rollback reservation when an item moves from PREPARING -> CANCELLED
      if (
        prevStatus === OrderItemStatus.PREPARING &&
        status === OrderItemStatus.CANCELLED
      ) {
        await this.reserveIngredientsService.rollback(
          orderItem.productId,
          orderItem.quantity,
        );
      }

      await this.orderItemRepository.update(orderItem.id!, {
        status,
        startedAt: status === OrderItemStatus.PREPARING ? new Date() : null,
        completedAt: status === OrderItemStatus.DONE ? new Date() : null,
        servedAt: status === OrderItemStatus.SERVED ? new Date() : null,
      });

      // After updating the item status, recompute the overall order status based on all item statuses
      const items = await this.orderItemRepository.findByOrderId(orderId);
      const newOrderStatus = computeOrderStatus(items.map((i) => i.status));
      const pricing = await this.orderPricingService.recomputeAndPersistPricing(
        order,
        items,
      );
      return await this.orderRepository.update(orderId, {
        status: newOrderStatus,
        subtotalAmount: pricing.subtotal,
        totalAmount: pricing.totalAmount,
      });
    });
  }
}
