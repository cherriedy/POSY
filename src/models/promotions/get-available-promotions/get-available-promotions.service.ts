import { Injectable } from "@nestjs/common";
import { PromotionRepository } from "../repositories";
import { PrismaService } from "src/providers/prisma/prisma.service";
import { PricingSnapshotRepository } from "src/models/orders/shared/repositories/pricing-snapshot-repository.abstract";

@Injectable()
export class GetAvailablePromotionsService {
    constructor(
        private readonly promotionRepository: PromotionRepository,
        private readonly prismaService: PrismaService,
        private readonly pricingSnapshotRepository: PricingSnapshotRepository,
    ) { }

    async execute(orderId: string) {
        const snapshot = await this.pricingSnapshotRepository.findByOrderId(orderId);

        if (!snapshot || !snapshot.id) {
            throw new Error('Snapshot not found');
        }

        // lấy items từ snapshot giống checkout
        const productIds = snapshot.order?.orderItems?.map(i => i.productId) ?? [];

        const products = await this.prismaService.product.findMany({
            where: { id: { in: productIds } },
        });

        const enrichedItems = snapshot.order?.orderItems?.map((item: any) => {
            const product = products.find(p => p.id === item.productId);

            if (!product) {
                throw new Error(`Product not found: ${item.productId}`);
            }

            const unitPrice = Number(product.price);

            return {
                productId: item.productId,
                categoryId: product.category_id,
                quantity: item.quantity,
                unitPrice,
                subtotal: unitPrice * item.quantity,
            };
        }) ?? [];

        const totalAmount = enrichedItems.reduce(
            (sum, i) => sum + i.subtotal,
            0,
        );

        // lấy domain promotions
        const promotions = await this.promotionRepository.getAvailablePromotions();

        return Promise.all(
            promotions.map(async (promo) => {
                const reasons: string[] = [];

                // dùng assertUsable
                try {
                    const usageCount = await this.promotionRepository.getUsageCount(promo.id!);
                    promo.assertUsable(usageCount);
                } catch (e) {
                    reasons.push('NOT_ACTIVE_OR_EXPIRED');
                }

                // MIN ORDER
                if (totalAmount < promo.minOrderValue) {
                    reasons.push('MIN_ORDER_NOT_MET');
                }

                // SPECIFIC ITEMS
                if (promo.applicability === 'SPECIFIC_ITEMS') {
                    const match = enrichedItems.some(item =>
                        (promo.promotionProducts ?? []).some(
                            p => p.product_id === item.productId,
                        ),
                    );

                    if (!match) reasons.push('NOT_APPLICABLE_PRODUCT');
                }

                // SPECIFIC CATEGORY
                if (promo.applicability === 'SPECIFIC_CATEGORIES') {
                    const match = enrichedItems.some(item =>
                        (promo.promotionCategories ?? []).some(
                            c => c.category_id === item.categoryId,
                        ),
                    );

                    if (!match) reasons.push('NOT_APPLICABLE_CATEGORY');
                }

                // QUANTITY
                if (promo.applicability === 'QUANTITY_BASED') {
                    const totalQty = enrichedItems.reduce(
                        (sum, i) => sum + i.quantity,
                        0,
                    );

                    if (totalQty < (promo.minQuantity ?? 0)) {
                        reasons.push('NOT_ENOUGH_QUANTITY');
                    }
                }

                return {
                    id: promo.id,
                    code: promo.code,
                    title: promo.title,
                    discountType: promo.discountType,
                    discountValue: promo.discountValue,
                    isEligible: reasons.length === 0,
                    ineligibleReasons: reasons,
                };
            }),
        );
    }
}