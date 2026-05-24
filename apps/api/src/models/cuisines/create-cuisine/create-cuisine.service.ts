import { Injectable } from '@nestjs/common';
import { CuisineRepository } from '../repositories/cuisine-repository.abstract';
import { Cuisine } from '../types/cuisine';
import { CuisineInsertPayload } from '../interfaces/cuisine-payloads.interface';

/**
 * Service responsible for creating new cuisines.
 */
@Injectable()
export class CreateCuisineService {
  constructor(private readonly cuisineRepository: CuisineRepository) {}

  /**
   * Creates a new cuisine with the provided data.
   *
   * @param payload - Data for creating the new cuisine
   * @returns The newly created cuisine
   * @throws DuplicateEntryError - If a cuisine with the same name already exists
   */
  async create(payload: CuisineInsertPayload): Promise<Cuisine> {
    return await this.cuisineRepository.create(payload as Cuisine);
  }
}
