import { Module } from '@nestjs/common';
import { OrderTaxCalculatorService } from './services/order-tax-calculator.service';
import { OrderContextService } from './services/order-context.service';
import { OrderModificationPolicyService } from './services/order-modification-policy.service';
import { OrderItemStatusService } from './services/order-item-status.service';
import { ReserveIngredientsService } from './services/reserve-ingredients.service';
import { OrderPricingService } from './services/order-pricing.service';

@Module({
  providers: [
    OrderTaxCalculatorService,
    OrderContextService,
    OrderModificationPolicyService,
    OrderItemStatusService,
    ReserveIngredientsService,
    OrderPricingService,
  ],
  exports: [
    OrderTaxCalculatorService,
    OrderContextService,
    OrderModificationPolicyService,
    OrderItemStatusService,
    ReserveIngredientsService,
    OrderPricingService,
  ],
})
export class OrderCoreModule {}
