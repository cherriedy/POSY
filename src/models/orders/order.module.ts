import { Global, Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import {
  OrderRepository,
  OrderRepositoryImpl,
  OrderItemRepository,
  OrderItemRepositoryImpl,
} from './repositories';
import { CreateOrderModule } from './create-order/create-order.module';
import { GetOrdersModule } from './get-orders/get-orders.module';
import { SessionOrJwtGuard } from './guards';

@Global()
@Module({
  providers: [
    {
      provide: OrderRepository,
      useClass: OrderRepositoryImpl,
    },
    {
      provide: OrderItemRepository,
      useClass: OrderItemRepositoryImpl,
    },
    SessionOrJwtGuard,
  ],
  imports: [CreateOrderModule, GetOrdersModule],
  controllers: [OrderController],
  exports: [OrderRepository, OrderItemRepository],
})
export class OrderModule {}
