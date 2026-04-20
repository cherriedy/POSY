import { Injectable } from '@nestjs/common';
import {
  MomoCallbackPayload,
  PaymentNotFoundException,
  PaymentVerificationStatus,
} from '../shared';
import { PromotionRedemptionRepository } from '../../promotions/repositories';
import { PaymentStatus } from '../shared/enums';
import { PaymentRepository } from '../shared/repositories/payment-repository.abstract';
import { OrderRepository } from '../../orders/shared/repositories/order-repository.abstract';
import { MomoPaymentGateway } from '../shared/providers/momo-payment-gateway';

@Injectable()
export class PaymentFacadeService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly promotionRedemptionRepository: PromotionRedemptionRepository,
    private readonly orderRepository: OrderRepository,
    private readonly momoPaymentGateway: MomoPaymentGateway,
  ) {}

  /**
   * Marks pending payments of an order as FAILED and releases reserved promotions.
   */
  async failPendingPaymentAndReleasePromotions(orderId: string): Promise<void> {
    const affected = await this.paymentRepository.updatePendingStatusByOrderId(
      orderId,
      PaymentStatus.FAILED,
    );

    if (affected > 0) {
      await this.promotionRedemptionRepository.deleteByOrderId(orderId);
    }
  }

  /**
   * Expires stale pending payments and releases their reserved promotions.
   *
   * @returns Number of expired payments.
   */
  async expireStalePendingPaymentsAndReleasePromotions(
    ttlMinutes = 15,
  ): Promise<number> {
    const cutoff = new Date(Date.now() - ttlMinutes * 60 * 1000);
    const stalePending =
      await this.paymentRepository.findPendingOlderThan(cutoff);
    if (stalePending.length === 0) return 0;

    const expired = await this.paymentRepository.expirePendingOlderThan(cutoff);
    if (expired === 0) return 0;

    const orderIds = [
      ...new Set(stalePending.map((payment) => payment.orderId)),
    ];
    await this.promotionRedemptionRepository.deleteByOrderIds(orderIds);
    return expired;
  }

  async handleMomoCallback(payload: MomoCallbackPayload): Promise<void> {
    const result = await this.momoPaymentGateway.verifyPayment(payload);

    // The 'orderId' from the MoMo callback corresponds to our 'order_id' (Order ID).
    // Since MoMo strictly rejects multiple transaction requests with the same 'orderId',
    // any retry attempt after a failed payment will generate a new Payment record tied to this same Order.
    // Therefore, we must query the most recent PENDING payment associated with this order to update it.
    const payment = await this.paymentRepository.findById(payload.orderId);
    if (!payment) throw new PaymentNotFoundException(payload.orderId);

    // Depending on the verification result, we update the payment status and related fields accordingly.
    if (result.status === PaymentVerificationStatus.SUCCESS) {
      await this.paymentRepository.update(payment.id!, {
        status: PaymentStatus.COMPLETED,
        referenceNumber: result.transactionId,
        metadata: result.rawResponse,
        paidAt: new Date(),
      });
    } else if (result.status === PaymentVerificationStatus.FAILED) {
      await this.paymentRepository.update(payment.id!, {
        status: PaymentStatus.FAILED,
        metadata: result.rawResponse,
      });
    }
  }
}
