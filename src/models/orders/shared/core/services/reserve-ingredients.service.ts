import { Injectable } from '@nestjs/common';
import { ProductIngredientRepository } from '../../../../products/repositories/product-ingredient-repository.abstract';
import {
  IngredientRepository,
  IngredientNotFoundException,
} from '../../../../ingredients';
import { InsufficientRequiredIngredientException } from '../../exceptions';

@Injectable()
export class ReserveIngredientsService {
  constructor(
    private readonly ingredientRepository: IngredientRepository,
    private readonly productIngredientRepository: ProductIngredientRepository,
  ) {}

  /**
   * Computes the total required quantity of each ingredient for a given product and quantity.
   *
   * This method retrieves all product-ingredient relationships for the specified product,
   * multiplies the required quantity of each ingredient by the desired product quantity,
   * and returns a list of ingredient requirements.
   * @param productId - The ID of the product for which to compute ingredient requirements.
   * @param quantity - The quantity of the product being ordered.
   * @returns A list of objects, each containing an `ingredientId` and the total `required` quantity.
   */
  private async computeRequirements(productId: string, quantity: number) {
    return await this.productIngredientRepository
      .findByProductId(productId)
      .then((pis) => {
        if (!pis || pis.length === 0) return [];
        return pis.map((pi) => ({
          ingredientId: pi.ingredientId,
          required: Number(pi.quantity) * quantity,
        }));
      });
  }

  async checkSufficiency(productId: string, quantity: number) {
    const requirements = await this.computeRequirements(productId, quantity);
    if (requirements.length === 0) return;

    for (const r of requirements) {
      const ingredient = await this.ingredientRepository.findById(
        r.ingredientId,
      );
      if (!ingredient) throw new IngredientNotFoundException(r.ingredientId);

      const requiredInt = Math.ceil(r.required);
      if (ingredient.stock < requiredInt) {
        throw new InsufficientRequiredIngredientException(
          ingredient.name,
          ingredient.id!,
          requiredInt,
          ingredient.stock,
        );
      }
    }
  }

  async reserve(productId: string, quantity: number): Promise<void> {
    await this.checkSufficiency(productId, quantity);

    const requirements = await this.computeRequirements(productId, quantity);
    if (requirements.length === 0) return;

    for (const r of requirements) {
      const ingredient = await this.ingredientRepository.findById(
        r.ingredientId,
      );
      if (!ingredient) throw new IngredientNotFoundException(r.ingredientId);

      const requiredInt = Math.ceil(r.required);
      await this.ingredientRepository.update(ingredient.id!, {
        stock: ingredient.stock - requiredInt,
      });
    }
  }

  async rollback(productId: string, quantity: number): Promise<void> {
    const requirements = await this.computeRequirements(productId, quantity);
    if (requirements.length === 0) return;

    for (const r of requirements) {
      const ingredient = await this.ingredientRepository.findById(
        r.ingredientId,
      );
      if (!ingredient) throw new IngredientNotFoundException(r.ingredientId);

      const requiredInt = Math.ceil(r.required);
      await this.ingredientRepository.update(ingredient.id!, {
        stock: ingredient.stock + requiredInt,
      });
    }
  }
}
