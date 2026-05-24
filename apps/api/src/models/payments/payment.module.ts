import { Module } from '@nestjs/common';
import { PaymentMethodsService } from '@posy/payments/features/payment-methods.service';
import { PublicPaymentMethodController } from './handlers/public-payment-method.controller';
import { PaymentMethodController } from './handlers/payment-method.controller';
import { PaymentController } from './handlers/payment.controller';
import { PaymentCoreService } from '@posy/payments/features/payment-core.service';
import { PaymentCheckoutService } from '@posy/payments/features/payment-checkout.service';
import { PaymentMiscellaneousService } from '@posy/payments/features/payment-miscellaneous.service';
import { PaymentFacadeService } from '@posy/payments/features/payment-facade.service';
import { MomoPaymentGateway } from '@posy/payments/shared/providers/momo-payment-gateway.service';
import { MomoConfigModule } from '@posy/shared';
import { PaymentRefundService } from '@posy/payments/features/payment-refund.service';
import { PaymentRepository } from '@posy/payments/shared/repositories/payment-repository.abstract';
import { PrismaPaymentRepository } from '@posy/payments/shared/repositories/prisma-payment-repository';
import { PaymentMethodRepository } from '@posy/payments/shared/repositories/payment-method-repository.abstract';
import { PrismaPaymentMethodRepository } from '@posy/payments/shared/repositories/prisma-payment-method-repository';

@Module({
  imports: [MomoConfigModule],
  providers: [
    { provide: PaymentRepository, useClass: PrismaPaymentRepository },
    {
      provide: PaymentMethodRepository,
      useClass: PrismaPaymentMethodRepository,
    },
    PaymentMethodsService,
    PaymentCoreService,
    PaymentFacadeService,
    PaymentCheckoutService,
    PaymentRefundService,
    PaymentMiscellaneousService,
    MomoPaymentGateway,
  ],
  exports: [PaymentRepository, PaymentMethodRepository],
  controllers: [
    PublicPaymentMethodController,
    PaymentMethodController,
    PaymentController,
  ],
})
export class PaymentModule {}
