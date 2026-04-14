import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TokenGeneratorsModule } from '../../authentication/common/token-generators';
import { StartSessionModule } from '../table-sessions';
import { JwtModule } from '@nestjs/jwt';
import { GuestOrderGateway } from './handlers/guest-order.gateway';
import { StaffOrderGateway } from './handlers/staff-order.gateway';
import { OrderCoreModule } from './shared/core/order-core.module';
import { RecordPreferenceModule } from '../table-sessions/features/record-preference/record-preference.module';
import { GuestOrderController } from './handlers/guest-order.controller';
import { StaffOrderController } from './handlers/staff-order.controller';
import { CreateOrderService } from './services/create-order.service';
import { GetOrdersService } from './services/get-orders.service';
import { UpdateOrderService } from './services/update-order.service';
import { UpdateOrderStatusService } from './services/update-order-status.service';
import { UpdateOrderItemStatusService } from './services/update-order-item-status.service';
import { GetReceiptService } from './services/get-receipt.service';
import { ProcessPaymentService } from './services/process-payment.service';
import { OrderRepository } from './shared/repositories/order-repository.abstract';
import { OrderRepositoryImpl } from './shared/repositories/order-repository';
import { OrderItemRepository } from './shared/repositories/order-item-repository.abstract';
import { OrderItemRepositoryImpl } from './shared/repositories/order-item-repository';
import { PricingSnapshotRepository } from './shared/repositories/pricing-snapshot-repository.abstract';
import { PricingSnapshotRepositoryImpl } from './shared/repositories/pricing-snapshot-repository';
import { RecommendationModule } from '../../recommendation/recommendation.module';
import { OrderFacadeService } from './services/order-facade.service';

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
    {
      provide: PricingSnapshotRepository,
      useClass: PricingSnapshotRepositoryImpl,
    },
    StaffOrderGateway,
    GuestOrderGateway,
    CreateOrderService,
    GetOrdersService,
    UpdateOrderService,
    UpdateOrderStatusService,
    UpdateOrderItemStatusService,
    GetReceiptService,
    ProcessPaymentService,
    OrderFacadeService,
  ],
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
    JwtModule,
    OrderCoreModule,
    TokenGeneratorsModule,
    StartSessionModule,
    RecordPreferenceModule,
    RecommendationModule,
  ],
  controllers: [StaffOrderController, GuestOrderController],
  exports: [
    OrderCoreModule,
    OrderRepository,
    OrderItemRepository,
    PricingSnapshotRepository,
    StaffOrderGateway,
    GuestOrderGateway,
    CreateOrderService,
    GetOrdersService,
    UpdateOrderService,
    UpdateOrderStatusService,
    UpdateOrderItemStatusService,
    GetReceiptService,
    ProcessPaymentService,
  ],
})
export class OrderModule {}
