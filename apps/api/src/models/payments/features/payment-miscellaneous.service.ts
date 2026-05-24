import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PaymentFacadeService } from './payment-facade.service';

@Injectable()
export class PaymentMiscellaneousService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(private readonly paymentFacadeService: PaymentFacadeService) {}

  /**
   * Cron job that runs every 10 minutes to expire stale pending payments.
   *
   * It calls the payment service to find and expire payments that have been in a pending state
   * for longer than a specified duration and releases any associated promotions. It handles the
   * payments which haven't been processed properly by webhooks due to network issues or user
   * abandoning the checkout process.
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async expirePendingPayments(): Promise<void> {
    const count =
      await this.paymentFacadeService.expireStalePendingPaymentsAndReleasePromotions(
        15,
      );

    if (count > 0) {
      this.logger.log(`Expired pending payments: ${count}`);
    }
  }
}
