import { Injectable } from '@nestjs/common';
import { OrderTax, TaxConfig, EntityTaxConfig, TaxRateType } from '../../taxes';
import { OrderItem } from '../types';

@Injectable()
export class OrderTaxCalculator {
  /**
   * Calculate product-level taxes for each order item.
   */
  calculateProductTaxes(
    createdOrderItems: OrderItem[],
    productTaxConfigs: EntityTaxConfig[][],
    orderId: string,
  ): { taxes: OrderTax[]; total: number } {
    const orderTaxes: OrderTax[] = [];
    let totalTaxAmount = 0;
    for (let i = 0; i < createdOrderItems.length; i++) {
      const item = createdOrderItems[i];
      const productTaxes = productTaxConfigs[i].filter((tc) => tc.isActive);
      for (const taxConfig of productTaxes) {
        if (!taxConfig.tax) continue;
        const tax = taxConfig.tax;
        const taxAmount = TaxConfig.calculate(
          tax.rateType,
          tax.chargeRate,
          item.subtotal,
          item.quantity,
        );
        totalTaxAmount += taxAmount;
        orderTaxes.push(
          new OrderTax(
            null,
            tax.id!,
            orderId,
            item.id,
            tax.name,
            tax.chargeRate,
            item.subtotal,
            taxAmount,
            item.quantity,
            null,
            null,
            null,
          ),
        );
      }
    }
    return { taxes: orderTaxes, total: totalTaxAmount };
  }

  /**
   * Calculate zone-level taxes for the order (not per item).
   */
  calculateZoneTaxes(
    zoneTaxConfigs: EntityTaxConfig[],
    createdOrderItems: OrderItem[],
    orderId: string,
    orderSubtotal: number,
    productLevelTaxTotal: number,
  ): { taxes: OrderTax[]; total: number } {
    const orderTaxes: OrderTax[] = [];
    let totalTaxAmount = 0;
    for (const taxConfig of zoneTaxConfigs) {
      if (!taxConfig.tax) continue;
      const tax = taxConfig.tax;
      let zoneQuantity: number | undefined = undefined;
      if (tax.rateType === TaxRateType.PER_UNIT) {
        zoneQuantity = createdOrderItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
      }
      const taxAmount = TaxConfig.calculate(
        tax.rateType,
        tax.chargeRate,
        orderSubtotal + productLevelTaxTotal,
        zoneQuantity,
      );
      totalTaxAmount += taxAmount;
      orderTaxes.push(
        new OrderTax(
          null,
          tax.id!,
          orderId,
          null,
          tax.name,
          tax.chargeRate,
          orderSubtotal,
          taxAmount,
          tax.rateType === TaxRateType.PER_UNIT ? zoneQuantity! : null,
          null,
          null,
          null,
        ),
      );
    }
    return { taxes: orderTaxes, total: totalTaxAmount };
  }

  /**
   * Calculate VAT taxes for the order.
   */
  calculateVatTaxes(
    vatTaxConfigs: TaxConfig[],
    orderId: string,
    totalAmount: number,
  ): OrderTax[] {
    const orderTaxes: OrderTax[] = [];
    for (const taxConfig of vatTaxConfigs) {
      const taxAmount = TaxConfig.calculate(
        taxConfig.rateType,
        taxConfig.chargeRate,
        totalAmount,
        undefined,
      );
      orderTaxes.push(
        new OrderTax(
          null,
          taxConfig.id!,
          orderId,
          null,
          taxConfig.name,
          taxConfig.chargeRate,
          totalAmount,
          taxAmount,
          null,
          null,
          null,
          null,
        ),
      );
    }
    return orderTaxes;
  }

  /**
   * Calculate service charges for the order.
   */
  calculateServiceCharges(
    serviceChargeConfigs: TaxConfig[],
    orderId: string,
    totalAmount: number,
  ): OrderTax[] {
    const orderTaxes: OrderTax[] = [];
    for (const chargeConfig of serviceChargeConfigs) {
      const chargeAmount = TaxConfig.calculate(
        chargeConfig.rateType,
        chargeConfig.chargeRate,
        totalAmount,
        undefined,
      );
      orderTaxes.push(
        new OrderTax(
          null,
          chargeConfig.id!,
          orderId,
          null,
          chargeConfig.name,
          chargeConfig.chargeRate,
          totalAmount,
          chargeAmount,
          null,
          null,
          null,
          null,
        ),
      );
    }
    return orderTaxes;
  }
}
