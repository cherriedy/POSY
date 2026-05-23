import { Injectable } from '@nestjs/common';
import { PromotionProductRepository } from '../repositories/promotion-product-repository.abstract';
import { PromotionRepository } from '../repositories/promotion-repository.abstract';
import { Promotion } from '../types/promotion';
import { PromotionProduct } from '../types/promotion-product';
import { PromotionApplicability } from '../enums/promotion-applicability.enum';
import { PromotionNotFoundError } from '../errors/promotion-not-found.error';
import { PromotionUnusableError } from '../errors/promotion-unusable.error';
import { DuplicateEntryError } from 'src/common/errors/duplicate-entry.error';
import { ProductsNotFoundException } from 'src/models/products/exceptions/product-not-found.exception';
import { ProductRepository } from 'src/models/products/repositories/product-repository.abstract';

@Injectable()
export class ReplacePromotionProductService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly productRepository: ProductRepository,
    private readonly promotionProductRepository: PromotionProductRepository,
  ) {}

  async replacePromotionProducts(
    promotionId: string,
    productIds: string[],
  ): Promise<PromotionProduct[]> {
    const promotion = await this.promotionRepository.findById(promotionId);

    if (!promotion || promotion.isDeleted) {
      throw new PromotionNotFoundError({ id: promotionId });
    }

    if (promotion.applicability !== PromotionApplicability.SPECIFIC_ITEMS) {
      throw new PromotionUnusableError(
        promotionId,
        'Promotion applicability does not allow products.',
        { applicability: promotion.applicability },
      );
    }

    const duplicateProductIds = productIds.filter(
      (id, index, arr) => arr.indexOf(id) !== index,
    );

    if (duplicateProductIds.length > 0) {
      throw new DuplicateEntryError('Duplicate productIds in request.', {
        duplicateProductIds: [...new Set(duplicateProductIds)],
      });
    }

    const uniqueProductIds = [...new Set(productIds)];

    const products = await this.productRepository.findByIds(uniqueProductIds);

    if (products.length !== uniqueProductIds.length) {
      throw new ProductsNotFoundException({
        missingIds: uniqueProductIds.filter(
          (id) => !products.some((c) => c.id === id),
        ),
      });
    }

    return await this.promotionProductRepository.replaceByProductIds(
      promotionId,
      uniqueProductIds,
    );
  }
}
