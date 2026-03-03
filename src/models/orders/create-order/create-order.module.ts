import { Module } from '@nestjs/common';
import { CreateOrderService } from './create-order.service';
import { ProductModule } from '../../products/product.module';
import { TaxModule } from '../../taxes/tax.module';
import { OrderTaxCalculator } from '../common/order-tax-calculator';
import { UnitOfWorkModule } from '../../../common/unit-of-works';

@Module({
  imports: [ProductModule, TaxModule, UnitOfWorkModule],
  providers: [CreateOrderService, OrderTaxCalculator],
  exports: [CreateOrderService],
})
export class CreateOrderModule {}
