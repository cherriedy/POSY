import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { OrderItemPayload } from '@posy/orders/interfaces/order-item-payload.interface';
import { OrderStatus } from '@posy/orders/enums/order-status.enum';
import { OrderUpdateRequestDto } from '@posy/orders/dto/order-update-request.dto';
import { OrderItemStatus } from '@posy/orders/enums/order-item-status.enum';
import { OrderNotFoundForSessionException } from '@posy/orders/exceptions/order-not-found-for-session.exception';
import { Order } from '@posy/orders/entities/order';
import { OrderItem } from '@posy/orders/entities/order-item';
import { GuestOrderGateway } from '../handlers/guest-order.gateway';
import { AtLeastOneItemRequiredException } from '@posy/shared';
import { ProductRepository } from '@posy/products/repositories/product-repository.abstract';
import { ProductNotFoundException } from '@posy/products/exceptions/product-not-found.exception';
import { OrderPricingService } from '../shared/core/services/order-pricing.service';
import { OrderModificationPolicyService } from '@posy/orders/services/order-modification-policy.service';
import { OrderRepository } from '@posy/orders/repositories/order-repository.abstract';
import { OrderItemRepository } from '@posy/orders/repositories/order-item-repository.abstract';
import { UserIdentity } from '@posy/auth';
import { computeOrderStatus } from '@posy/orders/utilities/order-status.util';
import { TableSessionRepository } from 'src/models/table-sessions/shared/repositories/table-session-repository.abstract';
import { TableSessionStatus } from 'src/models/table-sessions/shared/enums/table-session-status.enum';
import { TableSessionType } from 'src/models/table-sessions/shared/enums/table-session-type.enum';
import { StaffOrderGateway } from '../handlers/staff-order.gateway';
import { TableStatus } from 'src/models/tables/enums/table-status.enum';
import { TableRepository } from 'src/models/tables/repositories/table-repository.abstract';
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
    private readonly tableRepository: TableRepository,
  ) {}

  async execute(
    sessionId: string,
    dto: OrderUpdateRequestDto,
    user?: UserIdentity,
  ): Promise<Order> {
    const order = await this.orderRepository.findBySessionId(sessionId);
    if (!order) throw new OrderNotFoundForSessionException(sessionId);
    const table = await this.tableRepository.findById(order.tableId);

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

    // recompute pricing
    const validItems = updatedOrderItems.filter(
      (i) => i.status !== OrderItemStatus.CANCELLED,
    );

    const pricing = await this.orderPricingService.recomputeAndPersistPricing(
      order,
      validItems,
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
      if (table!.status == TableStatus.OCCUPIED) {
        await this.tableRepository.update(order.tableId, {
          status: TableStatus.AVAILABLE,
        });
      }
    }

    return updated;
  }

  async addItemsToOrder(
    orderId: string,
    items: OrderItemPayload[],
  ): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new OrderNotFoundForSessionException(orderId);

    // check policy
    this.orderModificationPolicy.assertOrderModifiable(order);

    // build new order items
    const newItems = await Promise.all(
      items.map(async (item) => {
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
    );

    await this.orderItemRepository.bulkCreate(newItems);

    // reload items
    const updatedItems = await this.orderItemRepository.findByOrderId(
      order.id!,
    );

    const validItems = updatedItems.filter(
      (i) => i.status !== OrderItemStatus.CANCELLED,
    );
    // recompute pricing
    const pricing = await this.orderPricingService.recomputeAndPersistPricing(
      order,
      validItems,
    );

    order.subtotalAmount = pricing.subtotal;
    order.totalAmount = pricing.totalAmount;

    // recompute status
    order.status = computeOrderStatus(updatedItems.map((i) => i.status));

    const updatedOrder = await this.orderRepository.update(order.id!, order);

    // Broadcast to guests if the corresponding table session is active and of type GUEST
    try {
      const session = await this.tableSessionRepository.findActiveByTableId(
        order.tableId,
      );
      if (!session || session.status !== TableSessionStatus.ACTIVE) {
        this.logger.warn(
          `No active session found for table ${order.tableId}. 
              Skipping guest notification for order ${order.id}.`,
        );
      } else {
        if (session.sessionType == TableSessionType.GUEST) {
          this.guestOrderGateway.emitOrderUpdated(order.tableId, order.id!);
        }
      }
    } catch (e) {
      this.logger.error(
        `Failed to broadcast order update to guests for order ${order.id}`,
        e instanceof Error ? e.stack : e,
      );
    }

    // Broadcast to staff
    try {
      this.staffOrderGateway.emitOrderUpdated(order.id!);
    } catch (e) {
      this.logger.error(
        `Failed to broadcast order update to staff for order ${order.id}`,
        e instanceof Error ? e.stack : e,
      );
    }

    return updatedOrder;
  }
}
