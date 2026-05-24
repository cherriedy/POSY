import { Global, Module } from '@nestjs/common';
import { PromotionController } from './promotion.controller';
import { PromotionRepository } from '@posy/promotions/shared/repositories/promotion-repository.abstract';
import { PrismaPromotionRepository } from '@posy/promotions/shared/repositories/prisma-promotion-repository';
import { PromotionCategoryRepository } from '@posy/promotions/shared/repositories/promotion-category-repository.abstract';
import { PrismaPromotionCategoryRepository } from '@posy/promotions/shared/repositories/prisma-promotion-category-repository';
import { PromotionProductRepository } from '@posy/promotions/shared/repositories/promotion-product-repository.abstract';
import { PrismaPromotionProductRepository } from '@posy/promotions/shared/repositories/prisma-promotion-product-repository';
import { PromotionRedemptionRepository } from '@posy/promotions/shared/repositories/promotion-redemption-repository.abstract';
import { PrismaPromotionRedemptionRepository } from '@posy/promotions/shared/repositories/prisma-promotion-redemption-repository';
import { PricingSnapshotPromotionRepository } from '@posy/promotions/shared/repositories/pricing-snapshot-promotion-repository.abstract';
import { PrismaPricingSnapshotPromotionRepository } from '@posy/promotions/shared/repositories/prisma-pricing-snapshot-promotion-repository';
import { PricingSnapshotRepository } from '../orders/shared/repositories/pricing-snapshot-repository.abstract';
import { PricingSnapshotRepositoryImpl } from '../orders/shared/repositories/pricing-snapshot-repository';
import { CreatePromotionService } from '@posy/promotions/features/create-promotion/create-promotion.service';
import { UpdatePromotionService } from '@posy/promotions/features/update-promotion/update-promotion.service';
import { UpdateExpiredPromotionJobService } from '@posy/promotions/features/update-promotion/update-expired-promotion-job.service';
import { GetPromotionsService } from '@posy/promotions/features/get-promotions/get-promotions.service';
import { DeletePromotionService } from '@posy/promotions/features/delete-promotion/delete-promotion.service';
import { ValidatePromotionService } from '@posy/promotions/features/validate-promotion/validate-promotion.service';
import { ReplacePromotionCategoriesService } from '@posy/promotions/features/replace-categories/replace-categories.service';
import { ReplacePromotionProductService } from '@posy/promotions/features/replace-products/replace-products.service';
import { GetAvailablePromotionsService } from '@posy/promotions/features/get-available-promotions/get-available-promotions.service';

@Global()
@Module({
  providers: [
    { provide: PromotionRepository, useClass: PrismaPromotionRepository },
    {
      provide: PromotionCategoryRepository,
      useClass: PrismaPromotionCategoryRepository,
    },
    {
      provide: PromotionProductRepository,
      useClass: PrismaPromotionProductRepository,
    },
    {
      provide: PromotionRedemptionRepository,
      useClass: PrismaPromotionRedemptionRepository,
    },
    {
      provide: PricingSnapshotPromotionRepository,
      useClass: PrismaPricingSnapshotPromotionRepository,
    },
    {
      provide: PricingSnapshotRepository,
      useClass: PricingSnapshotRepositoryImpl,
    },
    CreatePromotionService,
    UpdatePromotionService,
    UpdateExpiredPromotionJobService,
    GetPromotionsService,
    DeletePromotionService,
    ValidatePromotionService,
    ReplacePromotionCategoriesService,
    ReplacePromotionProductService,
    GetAvailablePromotionsService,
  ],
  controllers: [PromotionController],
  exports: [
    PromotionRepository,
    PromotionCategoryRepository,
    PromotionProductRepository,
    PromotionRedemptionRepository,
    PricingSnapshotPromotionRepository,
  ],
})
export class PromotionModule {}
