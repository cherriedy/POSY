import { Injectable, LoggerService, Inject } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Order } from '../../entities';
import { OrderItem } from '../../entities';
import { OrderContextService } from './order-context.service';
import { OrderTaxCalculatorService } from './order-tax-calculator.service';
import { PricingSnapshot } from '../../../../promotions/types';
import { PricingSnapshotRepository } from '../../repositories/pricing-snapshot-repository.abstract';
import { PricingSnapshotTaxRepository } from '../../../../taxes';
import { TaxType, OrderTax } from '../../../../taxes';

@Injectable()
export class OrderPricingService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(
    private readonly orderContextService: OrderContextService,
    private readonly orderTaxCalculator: OrderTaxCalculatorService,
    private readonly pricingSnapshotRepository: PricingSnapshotRepository,
    private readonly pricingSnapshotTaxRepository: PricingSnapshotTaxRepository,
  ) {}

  /**
   * Recomputes subtotal, taxes and pricing snapshot for an order based on its items.
   * Returns computed amounts and the created snapshot (if any).
   */
  async recomputeAndPersistPricing(
    order: Order,
    orderItems: OrderItem[],
  ): Promise<{
    subtotal: number;
    totalTaxAmount: number;
    totalAmount: number;
  }> {
    const orderId = order.id!;
    // Recompute pricing: subtotal and taxes
    const subtotal = orderItems.reduce((acc, it) => acc + it.subtotal, 0);
    // Build product ids in the same order as items
    const productIds = orderItems.map((it) => it.productId);

    const [
      productLevelTaxConfigs,
      zoneLevelTaxConfigs,
      serviceChargeConfigs,
      vatConfigs,
    ] = await Promise.all([
      this.orderContextService.getProductTaxConfigs(productIds),
      this.orderContextService.getZoneTaxConfigs(order.table?.zoneId ?? null),
      this.orderContextService.getActiveTaxesByType([TaxType.SERVICE_CHARGE]),
      this.orderContextService.getActiveTaxesByType([TaxType.VAT]),
    ]);

    const { taxes: productTaxes, total: productLevelTaxTotal } =
      this.orderTaxCalculator.calculateProductTaxes(
        orderItems,
        productLevelTaxConfigs,
        orderId,
      );

    const { taxes: zoneTaxes, total: zoneLevelTaxTotal } =
      this.orderTaxCalculator.calculateZoneTaxes(
        zoneLevelTaxConfigs,
        orderItems,
        orderId,
        subtotal,
        productLevelTaxTotal,
      );

    const intermediateSubtotal =
      subtotal + productLevelTaxTotal + zoneLevelTaxTotal;

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

    if (vatConfigs.length !== 0) {
      const vatTax = this.orderTaxCalculator.calculateVAT(
        vatConfigs[0],
        orderId,
        intermediateSubtotal,
      );
      orderTaxes.push(vatTax);
      totalTaxAmount += vatTax.taxAmount;
    }

    // Update or recreate pricing snapshot
    try {
      const existingSnapshot =
        await this.pricingSnapshotRepository.findByOrderId(orderId);
      if (existingSnapshot) {
        await this.pricingSnapshotRepository.deleteByOrderId(orderId);
      }

      const pricingSnapshot = new PricingSnapshot(
        null,
        orderId,
        subtotal,
        0,
        totalTaxAmount,
        subtotal + totalTaxAmount,
        null,
        null,
        null,
        null,
      );

      const createdSnapshot =
        await this.pricingSnapshotRepository.create(pricingSnapshot);

      if (orderTaxes.length > 0) {
        const snapshotTaxes = orderTaxes.map((ot) =>
          this.orderContextService.mapOrderTaxToSnapshotTax(
            createdSnapshot.id!,
            ot,
          ),
        );
        await this.pricingSnapshotTaxRepository.bulkCreate(snapshotTaxes);
      }
    } catch (e) {
      this.logger.error(
        `Failed to update pricing snapshot for order ${orderId}`,
        e instanceof Error ? e.stack : e,
      );
    }

    return {
      subtotal,
      totalTaxAmount,
      totalAmount: subtotal + totalTaxAmount,
    };
  }
}
