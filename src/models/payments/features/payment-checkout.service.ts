import { Injectable } from '@nestjs/common';
import { UnitOfWork } from '../../../common/unit-of-works';
import {
  OrderNotFoundException,
  OrderSnapshotNotFoundException,
  OrderStatus,
} from '../../orders/shared';
import { OrderRepository } from '../../orders/shared/repositories/order-repository.abstract';
import { PricingSnapshotRepository } from '../../orders/shared/repositories/pricing-snapshot-repository.abstract';
import { PaymentMethodNotFoundException } from '../shared';
import { PaymentMethodRepository } from '../shared/repositories/payment-method-repository.abstract';
import { PaymentProvider, PaymentStatus } from '../shared';
import { Payment } from '../shared';
import {
  PricingSnapshotPromotion,
  PromotionRedemption,
} from '../../promotions/types';
import {
  PricingSnapshotPromotionRepository,
  PromotionRedemptionRepository,
  PromotionRepository,
} from '../../promotions/repositories';
import { PromotionNotFoundException } from '../../promotions/exceptions';
import { PaymentCoreService } from './payment-core.service';
import { CheckoutRequestDto } from '../shared';
import { MomoPaymentGateway } from '../shared/providers/momo-payment-gateway';
import { UnsupportedValueException } from '../../../common/exceptions';
import { UpdateOrderStatusService } from 'src/models/orders/services/update-order-status.service';
import { Role } from 'src/common/enums';
import { OrderNotReadyForCheckoutException } from 'src/models/orders/shared/exceptions/order-not-ready-for-checkout.exception';

@Injectable()
export class PaymentCheckoutService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly pricingSnapshotRepository: PricingSnapshotRepository,
    private readonly paymentMethodRepository: PaymentMethodRepository,
    private readonly promotionRepository: PromotionRepository,
    private readonly pricingSnapshotPromotionRepository: PricingSnapshotPromotionRepository,
    private readonly promotionRedemptionRepository: PromotionRedemptionRepository,
    private readonly paymentService: PaymentCoreService,
    private readonly momoPaymentGateway: MomoPaymentGateway,
    private readonly uow: UnitOfWork,
    private readonly updateOrderStatusService: UpdateOrderStatusService,
  ) { }

  /**
   * Executes the payment checkout process.
   *
   * This method handles order validation, payment method validation, promotion application,
   * final amount calculation, and payment creation based on the chosen payment provider.
   *
   * @param payload - The payment checkout payload containing order, method, and promotion details.
   * @returns A Promise that resolves to the created Payment entity.
   * @throws OrderNotFoundException if the order does not exist.
   * @throws PaymentMethodNotFoundException if the payment method is not found or inactive.
   * @throws OrderSnapshotNotFoundException if the pricing snapshot for the order is not found.
   * @throws PromotionNotFoundException if any of the provided promotion IDs do not exist.
   */
  async execute(payload: PaymentCheckoutPayload): Promise<Payment> {
    const promotionIds: string[] = [...new Set(payload.promotionIds ?? [])];

    return await this.uow.execute!<Payment>(async () => {
      const order = await this.orderRepository.findById(payload.orderId);
      if (!order) throw new OrderNotFoundException(payload.orderId);

      if (order.status !== OrderStatus.SERVED) {
        throw new OrderNotReadyForCheckoutException();
      }

      const method = await this.paymentMethodRepository.findById(
        payload.methodId,
      );
      if (!method || !method.isActive) {
        throw new PaymentMethodNotFoundException(payload.methodId);
      }

      const snapshot = await this.pricingSnapshotRepository.findByOrderId(
        payload.orderId,
      );
      if (!snapshot || !snapshot.id) {
        throw new OrderSnapshotNotFoundException(payload.orderId);
      }

      let totalDiscount = 0;

      if (promotionIds.length > 0) {
        for (const pId of promotionIds) {
          const promotion = await this.promotionRepository.findById(pId);
          if (!promotion) throw new PromotionNotFoundException({ id: pId });

          const usageCount = await this.promotionRepository.getUsageCount(pId);
          promotion.assertUsable(usageCount); // Validate promotion can be applied based on usage limits
          const discountAmount = promotion.calculate(snapshot.subtotalAmount);
          totalDiscount += discountAmount;

          await this.pricingSnapshotPromotionRepository.create(
            new PricingSnapshotPromotion(
              null,
              snapshot.id,
              promotion.id!,
              promotion.code,
              promotion.version,
              discountAmount,
              null,
              null,
            ),
          );

          await this.promotionRedemptionRepository.create(
            new PromotionRedemption(
              null,
              promotion.id!,
              snapshot.id,
              payload.orderId,
              new Date(),
              null,
              null,
              null,
            ),
          );
        }
      }

      const finalAmount = Math.max(
        Math.round(snapshot.subtotalAmount + snapshot.totalTaxAmount - totalDiscount),
        0,
      );

      await this.pricingSnapshotRepository.updateAmounts(
        snapshot.id,
        totalDiscount,
        finalAmount,
      );

      if (method.provider === PaymentProvider.CASH) {
        const payment = await this.paymentService.createCheckoutPayment(
          new Payment(
            null,
            method.id!,
            payload.orderId,
            payload.user.id,
            finalAmount,
            null,
            null,
            PaymentStatus.COMPLETED,
            null,
            new Date(),
            null,
            null,
            null,
            null,
            null,
            null,
            null,
          ),
        );

        await this.updateOrderStatusService.execute({
          user: payload.user,
          order: {
            id: payload.orderId,
            status: OrderStatus.COMPLETED,
          },
        });
        return payment;
      }

      if (method.provider === PaymentProvider.MOMO) {
        const payment = await this.paymentService.createCheckoutPayment(
          new Payment(
            null,
            method.id!,
            payload.orderId,
            payload.user.id,
            finalAmount,
            null,
            null,
            PaymentStatus.PENDING,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
          ),
        );

        const momoPayment = await this.momoPaymentGateway.createPayment(
          payment.id!,
          finalAmount,
          { orderInfo: `Thanh toán đơn hàng #${payload.orderId}` },
        );

        return await this.paymentService.updateCheckoutPayment(payment.id!, {
          paymentUrl: momoPayment.redirectUrl,
        });
      }

      throw new UnsupportedValueException(
        method.provider,
        'Payment provider is not supported for checkout.',
      );
    });
  }
}

/**
 * Represents the payload for a payment checkout operation.
 *
 * @property staffId {string} - The ID of the staff member initiating the checkout.
 * @property orderId {string} - The ID of the order being checked out.
 * @property methodId {string} - The ID of the payment method chosen for checkout.
 * @property promotionIds {string[]} [optional] - An array of promotion IDs to apply to the order during checkout.
 */
export type PaymentCheckoutPayload = {
  user: {
    id: string;
    role: Role;
  };
  orderId: string;
  methodId: string;
  promotionIds?: string[];
};

export class PaymentCheckoutPayloadMapper {
  /**
   * Converts a CheckoutRequestDto and staffId into a PaymentCheckoutPayload.
   * @param staffId - The ID of the staff member.
   * @param dto - The CheckoutRequestDto containing order and payment details.
   * @returns A PaymentCheckoutPayload object.
   */
  static fromDto(
    user: { sub: string; role: Role },
    dto: CheckoutRequestDto,
  ): PaymentCheckoutPayload {
    return {
      user: {
        id: user.sub,
        role: user.role,
      },
      orderId: dto.orderId,
      methodId: dto.methodId,
      promotionIds: dto.promotionIds,
    };
  }
}
