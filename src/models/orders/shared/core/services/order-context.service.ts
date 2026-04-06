import { Injectable } from '@nestjs/common';
import {
  EntityTaxConfigRepository,
  TaxRepository,
  EntityType,
  TaxType,
  OrderTax,
  PricingSnapshotTax,
} from '../../../../taxes';
import { TableRepository } from '../../../../tables/repositories';
import { TableNotFoundException } from '../../../../tables/exceptions';
import { OrderItemPayload } from '../../interfaces';
import { ProductNotFoundException } from 'src/models/products/exceptions';
import { ProductRepository } from 'src/models/products/repositories/product-repository.abstract';

@Injectable()
export class OrderContextService {
  constructor(
    private readonly tableRepository: TableRepository,
    private readonly productRepository: ProductRepository,
    private readonly entityTaxConfigRepository: EntityTaxConfigRepository,
    private readonly taxRepository: TaxRepository,
  ) {}

  /**
   * Resolves a table by id and ensures it exists.
   *
   * @param tableId - Identifier of the table.
   * @returns The resolved table entity (including zone relationship if loaded by repository).
   * @throws TableNotFoundException - If the table does not exist.
   */
  async getRequiredTable(tableId: string) {
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
  async getRequiredProducts(items: OrderItemPayload[]) {
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
  async getProductTaxConfigs(productIds: string[]) {
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
  async getZoneTaxConfigs(zoneId: string | null) {
    if (!zoneId) return [];
    return await this.entityTaxConfigRepository
      .findByEntity(EntityType.ZONE, zoneId)
      .then((taxConfigs) =>
        taxConfigs.filter((taxConfig) => taxConfig.isActive),
      );
  }

  /**
   * Returns active tax configurations for the provided tax entities.
   *
   * This helper centralizes the "find by type + only active" pattern used
   * for VAT, service charges, and any future top-level tax entities.
   *
   * @param types - Array of tax entities to select (e.g., `[TaxType.VAT]`).
   * @returns Array of active tax configs matching the given entities.
   */
  async getActiveTaxesByType(types: TaxType[]) {
    return await this.taxRepository
      .findByType(types)
      .then((taxConfigs) =>
        taxConfigs.filter((taxConfig) => taxConfig.isActive),
      );
  }

  /**
   * Maps an `OrderTax` entity to a `PricingSnapshotTax` instance.
   *
   * @param snapshotId - The identifier of the pricing snapshot to associate with the tax.
   * @param orderTax - The `OrderTax` entity containing tax details for an order or order item.
   * @returns A new `PricingSnapshotTax` instance populated with the provided tax data and snapshot ID.
   */
  mapOrderTaxToSnapshotTax(
    snapshotId: string,
    orderTax: OrderTax,
  ): PricingSnapshotTax {
    return new PricingSnapshotTax(
      orderTax.id,
      snapshotId,
      orderTax.orderItemId,
      orderTax.taxConfigId,
      orderTax.taxName,
      orderTax.taxType,
      orderTax.rateType,
      orderTax.chargeRate,
      orderTax.taxableBase,
      orderTax.quantity,
      orderTax.taxAmount,
    );
  }
}
