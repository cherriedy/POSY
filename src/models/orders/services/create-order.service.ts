import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Order, OrderItem } from '../shared';
import { OrderItemStatus, OrderStatus } from '../shared';
import { UnitOfWork } from '../../../common/unit-of-works';
import { AtLeastOneItemRequiredException } from '../../../common/exceptions';
import { OrderItemPayload } from '../shared';
import { PricingSnapshot } from '../../promotions/types';
import { OrderTax, PricingSnapshotTaxRepository, TaxType } from '../../taxes';
import { RecordPreferenceService } from 'src/models/table-sessions/features/record-preference/record-preference.service';
import { StaffOrderGateway } from '../handlers/staff-order.gateway';
import { OrderTaxCalculatorService } from '../shared/core/services/order-tax-calculator.service';
import { OrderContextService } from '../shared/core/services/order-context.service';
import { OrderRepository } from '../shared/repositories/order-repository.abstract';
import { OrderItemRepository } from '../shared/repositories/order-item-repository.abstract';
import { PricingSnapshotRepository } from '../shared/repositories/pricing-snapshot-repository.abstract';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductInteractionPayload } from 'src/user-tracking/shared/interfaces/product-interaction-payload';
import { ProductInteractionType } from 'src/user-tracking/shared/enums/product-interaction-type.enum';

@Injectable()
export class CreateOrderService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly uow: UnitOfWork,
    private readonly orderTaxCalculator: OrderTaxCalculatorService,
    private readonly pricingSnapshotRepository: PricingSnapshotRepository,
    private readonly orderContextService: OrderContextService,
    private readonly pricingSnapshotTaxRepository: PricingSnapshotTaxRepository,
    private readonly recordSessionPreferenceService: RecordPreferenceService,
    private readonly staffOrderGateway: StaffOrderGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Creates a new order for the given table and session, handling all pricing, tax, and snapshot logic.
   *
   * @param payload - The structured payload containing order item details and table/session context.
   * @returns The fully persisted `Order` entity with all monetary fields updated.
   *
   * @throws AtLeastOneItemRequiredException If no items are provided in the payload.
   * @throws TableNotFoundException If the specified table does not exist.
   * @throws ProductNotFoundException If any referenced product does not exist.
   * @throws Error For any lower-level or transactional errors encountered during creation.
   *
   * @remarks
   * Workflow:
   * 1. Validates that at least one item is present in the payload.
   * 2. Resolves the table, products, and all relevant tax configurations.
   * 3. Executes all operations within a transactional boundary:
   *    - Persists a pending `Order` entity.
   *    - Persists all `OrderItem` entities and calculates the subtotal.
   *    - Calculates all applicable taxes using the `OrderTaxCalculatorService`.
   *    - Persists a `PricingSnapshot` and its associated `PricingSnapshotTax` rows.
   *    - Updates the order with the final subtotal and total (including all taxes).
   *    - Records session preferences based on the order items.
   *    - Emits the created order ID to the kitchen via WebSocket.
   */
  async execute(payload: CreateOrderPayload): Promise<Order> {
    const { table: tableContext, order: orderContext } = payload;

    this.assertHasItems(orderContext.items);

    const table = await this.orderContextService.getRequiredTable(
      tableContext.id,
    );
    const { productIds, products } =
      await this.orderContextService.getRequiredProducts(orderContext.items);

    const productLevelTaxConfigs =
      await this.orderContextService.getProductTaxConfigs(productIds);
    const zoneLevelTaxConfigs =
      await this.orderContextService.getZoneTaxConfigs(table.zoneId);
    const serviceChargeConfigs =
      await this.orderContextService.getActiveTaxesByType([
        TaxType.SERVICE_CHARGE,
      ]);
    const vatConfigs = await this.orderContextService.getActiveTaxesByType([
      TaxType.VAT,
    ]);

    return await this.uow.execute!(async () => {
      const pendingOrder = this.buildPendingOrder(
        tableContext.id,
        tableContext.session.id,
        tableContext.session.createdBy,
        orderContext.note,
      );

      const createdOrder = await this.orderRepository.create(pendingOrder);
      const orderId = createdOrder.id!;
      const { orderItems, orderSubtotal } = this.buildOrderItems(
        orderId,
        orderContext.items,
        products,
      );

      const createdOrderItems =
        await this.orderItemRepository.bulkCreate(orderItems);

      // Calculate the product-level taxes for each item based on its price and quantity
      const { taxes: productTaxes, total: productLevelTaxTotal } =
        this.orderTaxCalculator.calculateProductTaxes(
          createdOrderItems,
          productLevelTaxConfigs,
          orderId,
        );

      // Calculate the zone-level taxes based on the subtotal + product-level taxes
      const { taxes: zoneTaxes, total: zoneLevelTaxTotal } =
        this.orderTaxCalculator.calculateZoneTaxes(
          zoneLevelTaxConfigs,
          createdOrderItems,
          orderId,
          orderSubtotal,
          productLevelTaxTotal,
        );

      // The intermediate total before service charges and VAT:
      // subtotal plus all product-level and zone-level taxes
      const intermediateSubtotal =
        orderSubtotal + productLevelTaxTotal + zoneLevelTaxTotal;

      // Calculate service charges based on the intermediate total
      const { taxes: serviceChargeTaxes, total: serviceChargeTaxTotal } =
        this.orderTaxCalculator.calculateServiceCharges(
          serviceChargeConfigs,
          orderId,
          intermediateSubtotal,
        );

      const orderTaxes: OrderTax[] = [
        ...productTaxes,
        ...zoneTaxes,
        ...serviceChargeTaxes,
      ];

      let totalTaxAmount: number =
        productLevelTaxTotal + zoneLevelTaxTotal + serviceChargeTaxTotal;

      // Check if there is an active VAT config before applying VAT
      if (vatConfigs.length !== 0) {
        const vatTax = this.orderTaxCalculator.calculateVAT(
          vatConfigs[0],
          orderId,
          intermediateSubtotal,
        );
        orderTaxes.push(vatTax);
        totalTaxAmount += vatTax.taxAmount;
      }

      const pricingSnapshot = new PricingSnapshot(
        null,
        orderId,
        orderSubtotal,
        0,
        totalTaxAmount,
        orderSubtotal + totalTaxAmount,
        null,
        null,
        null,
        null,
      );

      const createdSnapshot =
        await this.pricingSnapshotRepository.create(pricingSnapshot);

      // Persist the snapshot taxes linked to the created snapshot
      await this.createSnapshotTaxes(createdSnapshot.id!, orderTaxes);

      // Record session preferences based on created items
      await this.recordSessionPreferenceService.execute(
        tableContext.session.id,
        createdOrderItems,
      );

      const finalOrder = await this.orderRepository.update(orderId, {
        subtotalAmount: orderSubtotal,
        totalAmount: orderSubtotal + totalTaxAmount,
      });

      // Emit product interaction ORDER events for each created order item
      try {
        if (createdOrderItems && createdOrderItems.length > 0) {
          for (const item of createdOrderItems) {
            const payload: ProductInteractionPayload = {
              sessionId: tableContext.session.id,
              productId: item.productId,
              type: ProductInteractionType.ORDER,
              quantity: item.quantity,
              price: item.unitPrice,
              timestamp: new Date().toISOString(),
            };

            // Non-blocking emit; user-tracking listens to 'interaction.product.*'
            this.eventEmitter.emit(
              `interaction.product.${ProductInteractionType.ORDER}`,
              payload,
            );
          }
        }
      } catch (e) {
        this.logger.error('Failed to emit product interaction ORDER events', e);
      }

      // Emit only the created order ID to staff and other roles
      this.staffOrderGateway.emitOrderCreated(orderId);

      return finalOrder;
    });
  }

  /**
   * Ensures the order payload contains at least one item.
   *
   * @param items - Collection of requested order items.
   * @throws AtLeastOneItemRequiredException - If the collection is empty or undefined.
   */
  private assertHasItems(items: OrderItemPayload[]): void {
    if (!items || items.length === 0) {
      throw new AtLeastOneItemRequiredException(
        'Order must contain at least one item',
      );
    }
  }

  /**
   * Constructs a new `Order` entity in the PENDING state with the provided context information.
   *
   * @param tableId - The ID of the table associated with the order.
   * @param sessionId - The ID of the session during which the order is being created.
   * @param createdBy - The ID of the staff that initiated the order creation.
   * @param note - An optional note to attach to the order.
   * @return A new `Order` entity instance with the specified context.
   */
  private buildPendingOrder(
    tableId: string,
    sessionId: string,
    createdBy: string | null,
    note: string | null,
  ): Order {
    return new Order(
      null,
      createdBy,
      tableId,
      sessionId,
      OrderStatus.PENDING,
      note,
      0,
      0,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    );
  }

  /**
   * Converts raw item payloads and resolved products into `OrderItem` entities
   * and simultaneously computes the overall order subtotal.
   *
   * @param orderId - Identifier of the parent order.
   * @param items - Raw item payloads from the request.
   * @param products - Resolved product entities aligned by index with `items`.
   * @returns The array of `OrderItem` entities and the aggregated subtotal.
   */
  private buildOrderItems(
    orderId: string,
    items: OrderItemPayload[],
    products: { price: number }[],
  ): { orderItems: OrderItem[]; orderSubtotal: number } {
    const orderItems: OrderItem[] = [];
    let orderSubtotal = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const product = products[i];

      const unitPrice = product.price;
      const subtotal = unitPrice * item.quantity;
      orderSubtotal += subtotal;

      orderItems.push(
        new OrderItem(
          null,
          orderId,
          item.productId,
          item.quantity,
          unitPrice,
          subtotal,
          item.note ?? null,
          OrderItemStatus.WAITING,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ),
      );
    }

    return { orderItems, orderSubtotal };
  }

  /**
   * Persists `PricingSnapshotTax` rows linked to the given snapshot id.
   *
   * @param snapshotId - The id of the newly created pricing snapshot.
   * @param orderTaxes - The collection of calculated order taxes to persist as snapshot taxes.
   * @returns A promise that resolves when the operation is complete.
   * @throws Any database errors encountered during the creation of snapshot taxes are bubbled up.
   */
  private async createSnapshotTaxes(
    snapshotId: string,
    orderTaxes: OrderTax[],
  ): Promise<void> {
    if (orderTaxes.length === 0) return;
    const snapshotTaxes = orderTaxes.map((ot) =>
      this.orderContextService.mapOrderTaxToSnapshotTax(snapshotId, ot),
    );
    await this.pricingSnapshotTaxRepository.bulkCreate(snapshotTaxes);
  }
}

/**
 * Defines the payload structure for creating a new order, including the necessary context
 * for table and session association. This payload is used internally to encapsulate all
 * necessary information for order creation, ensuring that the service has access to both
 * the order details and the context of the table session.
 */
export type CreateOrderPayload = {
  order: {
    items: OrderItemPayload[];
    note: string | null;
  };
  table: {
    id: string;
    session: {
      id: string;
      createdBy: string | null;
    };
  };
};

/**
 * Map the {@link OrderCreateRequestDto} to {@link CreateOrderPayload}, extracting the necessary context information.
 *
 * @param items - The array of order item payloads from the request DTO.
 * @param note - An optional note attached to the order.
 * @param tableId - The ID of the table for which the order is being created.
 * @param sessionId - The ID of the table session that owns this order.
 * @param createdBy - The ID of the staff that initiated the order creation, if applicable.
 * @returns The mapped payload ready for processing by the CreateOrderService.
 */
export function toPayload(
  items: OrderItemPayload[],
  tableId: string,
  sessionId: string,
  createdBy: string | null,
  note: string | null,
): CreateOrderPayload {
  return {
    order: {
      items,
      note,
    },
    table: {
      id: tableId,
      session: {
        id: sessionId,
        createdBy,
      },
    },
  };
}
