import { Injectable, LoggerService } from '@nestjs/common';
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
import { UpdateOrderStatusService } from 'src/models/orders/services/update-order-status.service';
import { OrderSnapshotNotFoundException, OrderStatus } from 'src/models/orders';
import { Role } from 'src/common/enums';
import { PromotionRedemption } from 'src/models/promotions/types';
import { PricingSnapshotRepository } from 'src/models/orders/shared/repositories/pricing-snapshot-repository.abstract';
import { StaffOrderGateway } from 'src/models/orders/handlers/staff-order.gateway';

@Injectable()
export class PaymentFacadeService {
  private readonly logger: LoggerService;
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly promotionRedemptionRepository: PromotionRedemptionRepository,
    private readonly orderRepository: OrderRepository,
    private readonly momoPaymentGateway: MomoPaymentGateway,
    private readonly updateOrderStatusService: UpdateOrderStatusService,
    private readonly pricingSnapshotRepository: PricingSnapshotRepository,
    private readonly staffOrderGateway: StaffOrderGateway,
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
      const orderId = payment.orderId;

      // create promotion redemption
      const snapshot =
        await this.pricingSnapshotRepository.findByOrderId(orderId);
      if (!snapshot || !snapshot.id || snapshot.promotions == null) {
        throw new OrderSnapshotNotFoundException(orderId);
      }
      for (const promo of snapshot.promotions) {
        await this.promotionRedemptionRepository.create(
          new PromotionRedemption(
            null,
            promo.promotionId!,
            snapshot.id,
            orderId,
            new Date(),
            null,
            null,
            null,
          ),
        );
      }

      // update payment
      await this.paymentRepository.update(payment.id!, {
        status: PaymentStatus.COMPLETED,
        referenceNumber: String(result.transactionId),
        metadata: result.rawResponse,
        paidAt: new Date(),
      });

      // Broadcast to staff
      try {
        this.staffOrderGateway.emitOrderUpdated(orderId, payment.id!);
      } catch (e) {
        this.logger.error(
          `Failed to broadcast order update to staff for order ${orderId}`,
          e instanceof Error ? e.stack : e,
        );
      }

      // MoMo callbacks are server-to-server, therefore there are NO real users.
      const systemUser = {
        id: 'system',
        role: Role.ADMIN,
      };

      // update status and end table session
      await this.updateOrderStatusService.execute({
        user: systemUser,
        order: {
          id: payment.orderId,
          status: OrderStatus.COMPLETED,
        },
      });
    } else if (result.status === PaymentVerificationStatus.FAILED) {
      await this.paymentRepository.update(payment.id!, {
        status: PaymentStatus.FAILED,
        metadata: result.rawResponse,
      });
    }
  }
}
