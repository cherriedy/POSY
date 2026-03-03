import { Injectable } from '@nestjs/common';
import {
  EntityTaxConfigRepository,
  OrderTaxRepository,
  TaxRepository,
} from '../../taxes/repositories';
import { OrderItemRepository, OrderRepository } from '../repositories';
import { Order, OrderItem } from '../types';
import { OrderItemStatus, OrderStatus } from '../enums';
import { ProductRepository } from '../../products/repositories';
import { OrderTax } from '../../taxes/types';
import { EntityType, TaxType } from '../../taxes/enums';
import { TableRepository } from '../../tables/repositories';
import { ProductNotFoundException } from '../../products/exceptions';
import { TableNotFoundException } from '../../tables/exceptions';
import { UnitOfWork } from '../../../common/unit-of-works';
import { AtLeastOneItemRequiredException } from '../../../common/exceptions';
import { OrderTaxCalculator } from '../common/order-tax-calculator';
import { OrderItemPayload } from '../interfaces';

@Injectable()
export class CreateOrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly productRepository: ProductRepository,
    private readonly entityTaxConfigRepository: EntityTaxConfigRepository,
    private readonly taxRepository: TaxRepository,
    private readonly orderTaxRepository: OrderTaxRepository,
    private readonly tableRepository: TableRepository,
    private readonly uow: UnitOfWork,
    private readonly orderTaxCalculator: OrderTaxCalculator,
  ) {}

  /**
   * Creates a new order for the given table and session.
   *
   * High‑level flow:
   * 1. Validate the payload (at least one item).
   * 2. Resolve table (and its zone), products, and tax configs.
   * 3. Within a transactional boundary:
   *    - Create a pending `Order`.
   *    - Create `OrderItem` records and compute subtotal.
   *    - Calculate all applicable taxes via `OrderTaxCalculator`.
   *    - Persist `OrderTax` records.
   *    - Update the order total (subtotal + all taxes).
   *
   * @param items - Raw order item payloads (product id, quantity, note, etc.).
   * @param tableId - Identifier of the table on which the order is placed.
   * @param sessionId - Identifier of the table session that owns this order.
   * @param createdBy - User or session identifier that initiated the order.
   * @param note - Optional free-form note attached to the order.
   *
   * @returns The fully persisted `Order` with updated subtotal/total amounts.
   *
   * @throws AtLeastOneItemRequiredException - When `items` is empty.
   * @throws TableNotFoundException - When the provided table id does not exist.
   * @throws ProductNotFoundException - When any referenced product id does not exist.
   * @throws Error - Any lower-level entities or transaction errors are bubbled up.
   */
  async create(
    items: OrderItemPayload[],
    tableId: string,
    sessionId: string,
    createdBy: string | null,
    note: string | null,
  ): Promise<Order> {
    this.assertHasItems(items);

    const table = await this.getRequiredTable(tableId);
    const { productIds, products } = await this.getRequiredProducts(items);
    const productTaxConfigs = await this.getProductTaxConfigs(productIds);
    const zoneTaxConfigs = await this.getZoneTaxConfigs(table.zoneId);

    return await this.uow.execute!(async () => {
      const pendingOrder = this.buildPendingOrder(
        tableId,
        sessionId,
        createdBy,
        note,
      );

      const createdOrder = await this.orderRepository.create(pendingOrder);
      const orderId = createdOrder.id!;

      const { orderItems, orderSubtotal } = this.buildOrderItems(
        orderId,
        items,
        products,
      );

      const createdOrderItems =
        await this.orderItemRepository.bulkCreate(orderItems);

      const { taxes: productTaxes, total: productLevelTaxTotal } =
        this.orderTaxCalculator.calculateProductTaxes(
          createdOrderItems,
          productTaxConfigs,
          orderId,
        );

      const { taxes: zoneTaxes, total: zoneLevelTaxTotal } =
        this.orderTaxCalculator.calculateZoneTaxes(
          zoneTaxConfigs,
          createdOrderItems,
          orderId,
          orderSubtotal,
          productLevelTaxTotal,
        );

      const subtotalPlusItemTaxes =
        orderSubtotal + productLevelTaxTotal + zoneLevelTaxTotal;

      const serviceChargeConfigs = await this.getActiveTaxesByType([
        TaxType.SERVICE_CHARGE,
      ]);
      const serviceChargeTaxes =
        this.orderTaxCalculator.calculateServiceCharges(
          serviceChargeConfigs,
          orderId,
          subtotalPlusItemTaxes,
        );

      const vatConfigs = await this.getActiveTaxesByType([TaxType.VAT]);
      const vatTaxes = this.orderTaxCalculator.calculateVatTaxes(
        vatConfigs,
        orderId,
        subtotalPlusItemTaxes,
      );

      const orderTaxes: OrderTax[] = [
        ...productTaxes,
        ...zoneTaxes,
        ...serviceChargeTaxes,
        ...vatTaxes,
      ];

      const totalTaxAmount =
        productLevelTaxTotal +
        zoneLevelTaxTotal +
        serviceChargeTaxes.reduce((s, t) => s + t.taxAmount, 0) +
        vatTaxes.reduce((s, t) => s + t.taxAmount, 0);

      if (orderTaxes.length > 0) {
        await this.orderTaxRepository.bulkCreate(orderTaxes);
      }

      return await this.orderRepository.update(orderId, {
        subtotalAmount: orderSubtotal,
        totalAmount: orderSubtotal + totalTaxAmount,
      });
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
   * Resolves a table by id and ensures it exists.
   *
   * @param tableId - Identifier of the table.
   * @returns The resolved table entity (including zone relationship if loaded by repository).
   * @throws TableNotFoundException - If the table does not exist.
   */
  private async getRequiredTable(tableId: string) {
    const table = await this.tableRepository.findById(tableId);
    if (!table) {
      throw new TableNotFoundException(`Table with ID "${tableId}" not found`);
    }
    return table;
  }

  /**
   * Resolves and validates all products referenced by the incoming items.
   *
   * @param items - Incoming order item payloads.
   * @returns An object containing product ids and the corresponding product entities.
   * @throws ProductNotFoundException - If any referenced product cannot be found.
   */
  private async getRequiredProducts(items: OrderItemPayload[]) {
    const productIds = items.map((item) => item.productId);
    const products = await Promise.all(
      productIds.map((id) => this.productRepository.findById(id)),
    );

    for (let i = 0; i < products.length; i++) {
      if (!products[i]) throw new ProductNotFoundException(productIds[i]);
    }

    return {
      productIds,
      products: products as NonNullable<(typeof products)[number]>[],
    };
  }

  /**
   * Retrieves all product-level tax associations for the provided product ids.
   *
   * @param productIds - Identifiers of the products included in the order.
   * @returns A 2D array of `EntityTaxConfig` grouped by product index.
   */
  private async getProductTaxConfigs(productIds: string[]) {
    return await Promise.all(
      productIds.map((id) =>
        this.entityTaxConfigRepository.findByEntity(EntityType.PRODUCT, id),
      ),
    );
  }

  /**
   * Resolves all zone-level tax associations for the given zone, if any.
   *
   * @param zoneId - Identifier of the table's zone; may be null for tables without a zone.
   * @returns Active zone-level tax configs or an empty array if no zone/associations exist.
   */
  private async getZoneTaxConfigs(zoneId: string | null) {
    if (!zoneId) return [];
    return await this.entityTaxConfigRepository
      .findByEntity(EntityType.ZONE, zoneId)
      .then((taxConfigs) =>
        taxConfigs.filter((taxConfig) => taxConfig.isActive),
      );
  }

  /**
   * Builds an in-memory pending order entity with zeroed monetary fields.
   *
   * The order is persisted later; this factory centralizes the construction
   * logic to keep the main `create` method readable.
   */
  private buildPendingOrder(
    tableId: string,
    sessionId: string,
    note: string | null,
    createdBy: string | null,
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
   *
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
   * Returns active tax configurations for the provided tax types.
   *
   * This helper centralizes the "find by type + only active" pattern used
   * for VAT, service charges, and any future top-level tax types.
   *
   * @param types - Array of tax types to select (e.g., `[TaxType.VAT]`).
   * @returns Array of active tax configs matching the given types.
   */
  private async getActiveTaxesByType(types: TaxType[]) {
    return await this.taxRepository
      .findByType(types)
      .then((taxConfigs) =>
        taxConfigs.filter((taxConfig) => taxConfig.isActive),
      );
  }
}
