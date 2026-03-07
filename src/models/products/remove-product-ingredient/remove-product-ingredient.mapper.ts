import { ProductIngredientBulkDeleteRequestDto } from '../dto';
import { ProductIngredientBulkRemovePayload } from '../interfaces';

export class RemoveProductIngredientMapper {
  static toPayload(
    productId: string,
    dto: ProductIngredientBulkDeleteRequestDto,
  ): ProductIngredientBulkRemovePayload {
    return {
      productId,
      ingredientIds: dto.ingredientIds,
    };
  }
}
