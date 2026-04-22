import { Module } from '@nestjs/common';
import { PaymentRepositoryModule } from './shared/repositories/payment-repository.module';
import { PaymentMethodsService } from './features/payment-methods.service';
import { PublicPaymentMethodController } from './handlers/public-payment-method.controller';
import { PaymentMethodController } from './handlers/payment-method.controller';
import { PaymentController } from './handlers/payment.controller';
import { PaymentCoreService } from './features/payment-core.service';
import { PaymentCheckoutService } from './features/payment-checkout.service';
import { PaymentMiscellaneousService } from './features/payment-miscellaneous.service';
import { PaymentFacadeService } from './features/payment-facade.service';
import { MomoPaymentGateway } from './shared/providers/momo-payment-gateway';
import { MomoConfigModule } from '../../config/momo/config.module';
import { PaymentRefundService } from './features/payment-refund.service';
import { UpdateOrderStatusService } from '../orders/services/update-order-status.service';

@Module({
  imports: [PaymentRepositoryModule, MomoConfigModule],
  exports: [PaymentRepositoryModule],
  providers: [
    PaymentMethodsService,
    PaymentCoreService,
    PaymentFacadeService,
    PaymentCheckoutService,
    PaymentRefundService,
    PaymentMiscellaneousService,
    MomoPaymentGateway,
    UpdateOrderStatusService,
  ],
  controllers: [
    PublicPaymentMethodController,
    PaymentMethodController,
    PaymentController,
  ],
})
export class PaymentModule {}
