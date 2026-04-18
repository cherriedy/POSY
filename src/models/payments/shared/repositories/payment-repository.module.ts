import { Module } from '@nestjs/common';
import { PaymentMethodRepository } from './payment-method-repository.abstract';
import { PaymentMethodRepositoryImpl } from './payment-method-repository';

@Module({
  providers: [
    {
      provide: PaymentMethodRepository,
      useClass: PaymentMethodRepositoryImpl,
    },
  ],
  exports: [PaymentMethodRepository],
})
export class PaymentRepositoryModule {}
