import { Injectable } from '@nestjs/common';
import { CuisineRepository } from '../repositories';
import { Cuisine } from '../types';
import { CuisineUpdatePayload } from '../interfaces/cuisine-payloads.interface';
import { CuisineNotFoundException } from '../exceptions';

/**
 * Service responsible for updating existing cuisines.
 */
@Injectable()
export class UpdateCuisineService {
  constructor(private readonly cuisineRepository: CuisineRepository) { }

  /**
   * Updates an existing cuisine with the provided data.
   *
   * @param id - Identifier of the cuisine to update
   * @param payload - Data for updating the cuisine including fields to update
   *
   * @returns The updated cuisine
   * @throws CuisineNotFoundException - If the cuisine does not exist
   * @throws DuplicateEntryException - If the new name conflicts with another cuisine
   */
  async update(id: string, payload: CuisineUpdatePayload): Promise<Cuisine> {
    const cuisine = await this.cuisineRepository.findById(id);
    if (!cuisine) throw new CuisineNotFoundException(id);
    return await this.cuisineRepository.update(id, payload as Partial<Cuisine>);
  }
}
