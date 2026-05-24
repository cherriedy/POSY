import { Global, Module } from '@nestjs/common';
import { PromotionController } from './promotion.controller';
import { PromotionCategoryRepository } from './repositories/promotion-category-repository.abstract';
import { PromotionCategoryRepositoryImpl } from './repositories/promotion-category-repository';
import { PromotionProductRepository } from './repositories/promotion-product-repository.abstract';
import { PromotionProductRepositoryImpl } from './repositories/promotion-product-repository';
import { PromotionRepository } from './repositories/promotion-repository.abstract';
import { PromotionRepositoryImpl } from './repositories/promotion-repository';
import { PromotionRedemptionRepository } from './repositories/promotion-redemption-repository.abstract';
import { PromotionRedemptionRepositoryImpl } from './repositories/promotion-redemption-repository';
import { PricingSnapshotPromotionRepository } from './repositories/pricing-snapshot-promotion-repository.abstract';
import { PricingSnapshotPromotionRepositoryImpl } from './repositories/pricing-snapshot-promotion-repository';
import { CreatePromotionModule } from './create-promotion/create-promotion.module';
import { UpdatePromotionModule } from './update-promotion/update-promotion.module';
import { GetPromotionsModule } from './get-promotions/get-promotions.module';
import { DeletePromotionModule } from './delete-promotion/delete-promotion.module';
import { ValidatePromotionModule } from './validate-promotion/validate-promotion.module';
import { CategoryModule } from '../categories/category.module';
import { ReplacePromotionCategoriesModule } from './replace-categories/replace-categories.module';
import { ReplacePromotionProductModule } from './replace-products/replace-products.module';
import { GetAvailablePromotionsModule } from './get-available-promotions/get-available-promotions.module';
import { PricingSnapshotRepositoryImpl } from '../orders/shared/repositories/pricing-snapshot-repository';
import { PricingSnapshotRepository } from '../orders/shared/repositories/pricing-snapshot-repository.abstract';

@Global()
@Module({
  providers: [
    {
      provide: PromotionRepository,
      useClass: PromotionRepositoryImpl,
    },
    {
      provide: PromotionCategoryRepository,
      useClass: PromotionCategoryRepositoryImpl,
    },
    {
      provide: PromotionProductRepository,
      useClass: PromotionProductRepositoryImpl,
    },
    {
      provide: PromotionRedemptionRepository,
      useClass: PromotionRedemptionRepositoryImpl,
    },
    {
      provide: PricingSnapshotPromotionRepository,
      useClass: PricingSnapshotPromotionRepositoryImpl,
    },
    {
      provide: PricingSnapshotRepository,
      useClass: PricingSnapshotRepositoryImpl,
    },
  ],
  imports: [
    CreatePromotionModule,
    UpdatePromotionModule,
    ReplacePromotionCategoriesModule,
    ReplacePromotionProductModule,
    GetPromotionsModule,
    DeletePromotionModule,
    ValidatePromotionModule,
    CategoryModule,
    GetAvailablePromotionsModule,
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
