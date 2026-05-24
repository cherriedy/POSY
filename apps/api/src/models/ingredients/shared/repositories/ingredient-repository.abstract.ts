import { BaseRepository } from '@posy/shared';
import { Page } from '@posy/shared';
import { Ingredient } from '../entities/ingredient';
import { IngredientQueryParams } from '../interfaces/ingredient-query-params.interface';

export abstract class IngredientRepository implements BaseRepository<Ingredient> {
  abstract create(entity: Ingredient): Promise<Ingredient>;

  abstract delete(id: string): Promise<void>;

  abstract findById(id: string): Promise<Ingredient | null>;

  abstract findByIds(ids: string[]): Promise<Ingredient[]>;

  abstract getAllPaged(
    params: IngredientQueryParams,
  ): Promise<Page<Ingredient>>;

  abstract update(id: string, entity: Partial<Ingredient>): Promise<Ingredient>;
}
