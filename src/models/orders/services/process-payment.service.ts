import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { OrderTaxMapper } from '../../taxes';
import { OrderTax } from '../../taxes';
import {
  PromotionRedemption,
  PromotionRedemptionMapper,
} from '../../promotions/types';
import { Payment, PaymentMapper } from '../../payments/types';
import { PaymentStatus } from '../../payments/enums';
import { OrderStatus } from '../shared';
import {
  OrderNotFoundException,
  OrderSnapshotNotFoundException,
  OrderAlreadyCompletedException,
} from '../shared';
import { PricingSnapshotRepository } from '../shared/repositories/pricing-snapshot-repository.abstract';
import { OrderRepository } from '../shared/repositories/order-repository.abstract';

export interface ProcessPaymentInput {
  methodId: string;
  amount: number;
  feeAmount?: number;
  referenceNumber?: string;
  createdBy?: string;
  metadata?: Record<string, unknown>;
}

export interface ProcessPaymentResult {
  payment: Payment;
  orderTaxes: OrderTax[];
  redemptions: PromotionRedemption[];
}

@Injectable()
export class ProcessPaymentService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly pricingSnapshotRepository: PricingSnapshotRepository,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Processes payment for a completed order — Stage 3 of the pricing lifecycle.
   *
   * Everything runs inside a single Prisma interactive transaction so that
   * either ALL of the following happen, or NONE:
   *  a) PricingSnapshotTax rows are copied into permanent OrderTax records.
   *  b) PricingSnapshotPromotion rows are copied into permanent PromotionRedemption records.
   *  c) A Payment record is written with status = COMPLETED.
   *  d) The Order status is updated to COMPLETED.
   *
   * NOTE: The PricingSnapshot itself is intentionally NOT deleted.
   * PromotionRedemption rows hold a foreign key reference to the snapshot
   * (as an immutable audit trail of which pricing context was agreed upon),
   * so the snapshot must remain in the database after payment.
   *
   * @param orderId - The order being paid.
   * @param input   - Payment details (method, amount, optional metadata).
   * @returns The permanent Payment, OrderTax, and PromotionRedemption records.
   */
  async processPayment(
    orderId: string,
    input: ProcessPaymentInput,
  ): Promise<ProcessPaymentResult> {
    // --- Pre-flight checks (outside transaction) ---
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new OrderNotFoundException(orderId);

    if (
      order.status === OrderStatus.COMPLETED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new OrderAlreadyCompletedException(orderId);
    }

    const snapshot =
      await this.pricingSnapshotRepository.findByOrderId(orderId);
    if (!snapshot) throw new OrderSnapshotNotFoundException(orderId);

    // --- Atomic transaction ---
    return await this.prismaService.$transaction(async (tx) => {
      // (a) Copy PricingSnapshotTax → permanent OrderTax rows.
      //     Build the Prisma input inline to avoid the any-typed OrderTaxMapper.toPrisma.
      const taxData = (snapshot.taxes ?? []).map((st) => ({
        tax_config_id: st.taxConfigId,
        order_id: orderId,
        order_item_id: null as string | null,
        tax_name: st.taxName,
        tax_type: st.taxType,
        rate_type: st.rateType,
        charge_rate: new Prisma.Decimal(st.chargeRate),
        taxable_base: new Prisma.Decimal(st.taxableBase),
        tax_amount: new Prisma.Decimal(st.taxAmount),
        quantity: st.quantity ?? null,
      }));

      const createdTaxRows = await Promise.all(
        taxData.map((d) => tx.orderTax.create({ data: d })),
      );

      // (b) Copy PricingSnapshotPromotion → permanent PromotionRedemption rows
      const redemptionData = (snapshot.promotions ?? []).map((sp) => ({
        promotion_id: sp.promotionId,
        snapshot_id: snapshot.id!, // audit reference — snapshot stays in DB
        order_id: orderId,
        redeemed_at: new Date(),
      }));

      const createdRedemptionRows = await Promise.all(
        redemptionData.map((d) => tx.promotionRedemption.create({ data: d })),
      );

      // (c) Write Payment record (status = COMPLETED, paid_at = now)
      const createdPaymentRow = await tx.payment.create({
        data: {
          method_id: input.methodId,
          order_id: orderId,
          created_by: input.createdBy ?? null,
          amount: new Prisma.Decimal(input.amount),
          fee_amount:
            input.feeAmount != null
              ? new Prisma.Decimal(input.feeAmount)
              : null,
          reference_number: input.referenceNumber ?? null,
          status: PaymentStatus.COMPLETED,
          paid_at: new Date(),
          metadata: (input.metadata as Prisma.InputJsonValue) ?? null,
        },
        include: { method: true },
      });

      // (d) Mark order COMPLETED
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.COMPLETED },
      });

      return {
        payment: PaymentMapper.toDomain(createdPaymentRow),

        orderTaxes: createdTaxRows.map(OrderTaxMapper.toDomain),

        redemptions: createdRedemptionRows.map(
          PromotionRedemptionMapper.toDomain,
        ),
      };
    });
  }
}
