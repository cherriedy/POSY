import { Injectable } from '@nestjs/common';
import {
  OrderTax,
  TaxConfig,
  EntityTaxConfig,
  TaxRateType,
} from '../../../../taxes';
import { OrderItem } from '../../entities';

@Injectable()
export class OrderTaxCalculatorService {
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
            tax.type,
            tax.rateType,
            tax.chargeRate,
            item.subtotal,
            taxAmount,
            item.quantity,
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
          tax.type,
          tax.rateType,
          tax.chargeRate,
          orderSubtotal,
          taxAmount,
          tax.rateType === TaxRateType.PER_UNIT ? zoneQuantity! : null,
          null,
          null,
        ),
      );
    }
    return { taxes: orderTaxes, total: totalTaxAmount };
  }

  /**
   * Calculate VAT tax for the order.
   */
  calculateVAT(
    taxConfig: TaxConfig,
    orderId: string,
    totalAmount: number,
  ): OrderTax {
    const taxAmount = TaxConfig.calculate(
      taxConfig.rateType,
      taxConfig.chargeRate,
      totalAmount,
      undefined,
    );
    return new OrderTax(
      null,
      taxConfig.id!,
      orderId,
      null,
      taxConfig.name,
      taxConfig.type,
      taxConfig.rateType,
      taxConfig.chargeRate,
      totalAmount,
      taxAmount,
      null,
      null,
      null,
    );
  }

  /**
   * Calculate service charges for the order.
   *
   * @param serviceChargeConfigs - Array of service charge tax configs.
   * @param orderId - The order ID.
   * @param totalAmount - The total amount to apply service charges to.
   * @returns An object containing the array of service charge OrderTax and the total service charge amount.
   */
  calculateServiceCharges(
    serviceChargeConfigs: TaxConfig[],
    orderId: string,
    totalAmount: number,
  ): { taxes: OrderTax[]; total: number } {
    const orderTaxes: OrderTax[] = [];
    let totalServiceCharge = 0;
    for (const chargeConfig of serviceChargeConfigs) {
      const chargeAmount = TaxConfig.calculate(
        chargeConfig.rateType,
        chargeConfig.chargeRate,
        totalAmount,
        undefined,
      );
      totalServiceCharge += chargeAmount;
      orderTaxes.push(
        new OrderTax(
          null,
          chargeConfig.id!,
          orderId,
          null,
          chargeConfig.name,
          chargeConfig.type,
          chargeConfig.rateType,
          chargeConfig.chargeRate,
          totalAmount,
          chargeAmount,
          null,
          null,
          null,
        ),
      );
    }
    return { taxes: orderTaxes, total: totalServiceCharge };
  }
}
