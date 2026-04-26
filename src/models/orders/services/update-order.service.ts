import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { OrderStatus, OrderUpdateRequestDto } from '../shared';
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
import {
  TableSessionRepository,
  TableSessionStatus,
  TableSessionType,
} from 'src/models/table-sessions';
import { StaffOrderGateway } from '../handlers/staff-order.gateway';
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
    private readonly staffOrderGateway: StaffOrderGateway,
    private readonly orderPricingService: OrderPricingService,
    private readonly tableSessionRepository: TableSessionRepository,
  ) {}

  async execute(
    sessionId: string,
    dto: OrderUpdateRequestDto,
    user?: UserIdentity,
  ): Promise<Order> {
    const order = await this.orderRepository.findBySessionId(sessionId);
    if (!order) throw new OrderNotFoundForSessionException(sessionId);

    // Delegate policy checks to a reusable service
    this.orderModificationPolicy.assertOrderModifiable(order, user);

    if (dto.add?.length) {
      await Promise.all(
        dto.add.map(async (item) => {
          const product = await this.productRepository.findById(item.productId);
          if (!product) throw new ProductNotFoundException(item.productId);
          return new OrderItem(
            null,
            order.id!,
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
            .then((order) => {
              if (order) {
                if (item.quantity) order.quantity = item.quantity;
                if (item.note) order.note = item.note;
                order.subtotal = order.quantity * order.unitPrice;
                return this.orderItemRepository.update(order.id!, order);
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

    if (dto.note) order.note = dto.note; // Update order-level note if provided

    const updatedOrderItems = await this.orderItemRepository.findByOrderId(
      order.id!,
    );

    if (updatedOrderItems.length === 0) {
      throw new AtLeastOneItemRequiredException();
    }

    // recompute status
    const newStatus = computeOrderStatus(
      updatedOrderItems.map((i) => i.status),
    );

    // pricing
    const pricing = await this.orderPricingService.recomputeAndPersistPricing(
      order,
      updatedOrderItems,
    );

    order.subtotalAmount = pricing.subtotal;
    order.totalAmount = pricing.totalAmount;
    order.status = newStatus;

    const updated = await this.orderRepository.update(order.id!, order);

    // Broadcast to guests if the corresponding table session is active and of type GUEST
    try {
      const session = await this.tableSessionRepository.findActiveByTableId(
        updated.tableId,
      );
      if (!session || session.status !== TableSessionStatus.ACTIVE) {
        this.logger.warn(
          `No active session found for table ${updated.tableId}. 
              Skipping guest notification for order ${updated.id}.`,
        );
      } else {
        if (session.sessionType == TableSessionType.GUEST) {
          this.guestOrderGateway.emitOrderUpdated(updated.tableId, updated.id!);
        }
      }
    } catch (e) {
      this.logger.error(
        `Failed to broadcast order update to guests for order ${updated.id}`,
        e instanceof Error ? e.stack : e,
      );
    }

    // Broadcast to staff
    try {
      this.staffOrderGateway.emitOrderUpdated(updated.id!);
    } catch (e) {
      this.logger.error(
        `Failed to broadcast order update to staff for order ${updated.id}`,
        e instanceof Error ? e.stack : e,
      );
    }

    // If order is CANCELLED → end session
    const shouldEndSession = order.status === OrderStatus.CANCELLED;

    if (shouldEndSession) {
      const session = await this.tableSessionRepository.findActiveByTableId(
        order.tableId,
      );

      if (session) {
        await this.tableSessionRepository.endSession(session.id!);
      }
    }

    return updated;
  }
}
