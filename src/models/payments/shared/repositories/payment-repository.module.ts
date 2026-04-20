import { Module } from '@nestjs/common';
import { PaymentMethodRepository } from './payment-method-repository.abstract';
import { PaymentMethodRepositoryImpl } from './payment-method-repository';
import { PaymentRepository } from './payment-repository.abstract';
import { PaymentRepositoryImpl } from './payment-repository';

@Module({
  providers: [
    {
      provide: PaymentMethodRepository,
      useClass: PaymentMethodRepositoryImpl,
    },
    {
      provide: PaymentRepository,
      useClass: PaymentRepositoryImpl,
    },
  ],
  exports: [PaymentMethodRepository, PaymentRepository],
})
export class PaymentRepositoryModule {}
