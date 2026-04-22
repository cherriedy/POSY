import { BadRequestException, Injectable } from "@nestjs/common";
import { PaymentRepository } from "../shared/repositories/payment-repository.abstract";
import { MomoPaymentGateway } from "../shared/providers/momo-payment-gateway";
import { UnitOfWork } from "src/common/unit-of-works";
import { Payment, PaymentNotFoundException, PaymentProvider, PaymentStatus } from "../shared";

@Injectable()
export class PaymentRefundService {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly momoGateway: MomoPaymentGateway,
        private readonly uow: UnitOfWork,
    ) { }

    async execute(paymentId: string): Promise<Payment> {
        return this.uow.execute!<Payment>(async () => {
            const payment = await this.paymentRepository.findById(paymentId);

            if (!payment) {
                throw new PaymentNotFoundException(paymentId);
            }
            
            if (payment.status !== PaymentStatus.COMPLETED) {
                throw new BadRequestException(
                    'Only COMPLETED payments can be refunded',
                );
            }

            // gọi provider
            let success = false;

            switch (payment.method?.provider) {
                case PaymentProvider.MOMO:
                    if (!payment.referenceNumber) {
                        throw new BadRequestException(
                            'Missing transaction reference for refund',
                        );
                    }
                    success = await this.momoGateway.refundPayment(
                        payment.referenceNumber,
                        Number(payment.amount),
                    );
                    break;

                case PaymentProvider.CASH:
                    // tiền mặt → chỉ update DB
                    success = true;
                    break;

                default:
                    throw new BadRequestException('Unsupported payment provider');
            }

            if (!success) {
                throw new BadRequestException('Refund failed from provider');
            }

            // update status
            return await this.paymentRepository.update(paymentId, {
                status: PaymentStatus.REFUNDED,
                updatedAt: new Date(),
            });
        });
    }
}