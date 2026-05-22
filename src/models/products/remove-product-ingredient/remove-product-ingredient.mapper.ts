import { ProductIngredientBulkDeleteRequestDto } from '../dto/product-ingredient-bulk-delete-request.dto';
import { ProductIngredientBulkRemovePayload } from '../interfaces/product-payloads';

export class RemoveProductIngredientMapper {
  static toPayload(
    productId: string,
    dto: ProductIngredientBulkDeleteRequestDto,
  ): ProductIngredientBulkRemovePayload {
    return {
      productId,
      associationIds: dto.associationIds,
    };
  }
}
