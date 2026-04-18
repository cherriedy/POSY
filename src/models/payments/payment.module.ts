import { Module } from '@nestjs/common';
import { PaymentRepositoryModule } from './shared/repositories/payment-repository.module';
import { PaymentMethodsService } from './features/payment-methods.service';
import { PublicPaymentMethodController } from './public-payment-method.controller';
import { PaymentMethodController } from './payment-method.controller';
import { PaymentController } from './payment.controller';
import { PaymentService } from './features/payment.service';

@Module({
  imports: [PaymentRepositoryModule],
  exports: [PaymentRepositoryModule],
  providers: [PaymentMethodsService, PaymentService],
  controllers: [
    PublicPaymentMethodController,
    PaymentMethodController,
    PaymentController,
  ],
})
export class PaymentModule {}
