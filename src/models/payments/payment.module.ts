import { Module } from '@nestjs/common';
import { PaymentRepositoryModule } from './shared/repositories/payment-repository.module';
import { PaymentMethodsService } from './features/payment-methods.service';
import { PublicPaymentMethodController } from './public-payment-method.controller';
import { PaymentMethodController } from './payment-method.controller';

@Module({
  imports: [PaymentRepositoryModule],
  exports: [PaymentRepositoryModule],
  providers: [PaymentMethodsService],
  controllers: [PublicPaymentMethodController, PaymentMethodController],
})
export class PaymentModule {}
