import { Global, Module } from '@nestjs/common';
import { PromotionController } from './promotion.controller';
import {
  PromotionCategoryRepository,
  PromotionCategoryRepositoryImpl,
  PromotionProductRepository,
  PromotionProductRepositoryImpl,
  PromotionRepository,
  PromotionRepositoryImpl,
  PromotionRedemptionRepository,
  PromotionRedemptionRepositoryImpl,
  PricingSnapshotPromotionRepository,
  PricingSnapshotPromotionRepositoryImpl,
} from './repositories';
import { CreatePromotionModule } from './create-promotion/create-promotion.module';
import { UpdatePromotionModule } from './update-promotion/update-promotion.module';
import { GetPromotionsModule } from './get-promotions/get-promotions.module';
import { DeletePromotionModule } from './delete-promotion/delete-promotion.module';
import { ValidatePromotionModule } from './validate-promotion/validate-promotion.module';
import { CategoryModule } from '../categories/category.module';
import { ReplacePromotionCategoriesModule } from './replace-categories/replace-categories.module';
import { ReplacePromotionProductModule } from './replace-products/replace-products.module';
import { GetAvailablePromotionsModule } from './get-available-promotions/get-available-promotions.module';

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
    GetAvailablePromotionsModule
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
