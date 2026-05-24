import { Global, Module } from '@nestjs/common';
import { OrderRepository } from './repositories/order-repository.abstract';
import { OrderRepositoryImpl } from './repositories/order-repository';
import { OrderItemRepository } from './repositories/order-item-repository.abstract';
import { OrderItemRepositoryImpl } from './repositories/order-item-repository';
import { GetOrdersService } from './services/get-orders.service';
import { OrderModificationPolicyService } from './services/order-modification-policy.service';

@Global()
@Module({
  providers: [
    { provide: OrderRepository, useClass: OrderRepositoryImpl },
    { provide: OrderItemRepository, useClass: OrderItemRepositoryImpl },
    GetOrdersService,
    OrderModificationPolicyService,
  ],
  exports: [
    OrderRepository,
    OrderItemRepository,
    GetOrdersService,
    OrderModificationPolicyService,
  ],
})
export class OrdersModule {}
