import { Injectable } from '@nestjs/common';
import { CuisineRepository } from '../repositories';
import { Cuisine } from '../types';
import { CuisineQueryParams } from '../interfaces';
import { Page } from '../../../common/interfaces';
import { CuisineNotFoundException } from '../exceptions';

/**
 * Service responsible for retrieving cuisines.
 */
@Injectable()
export class GetCuisinesService {
  constructor(private readonly cuisineRepository: CuisineRepository) {}

  /**
   * Retrieves a paginated list of cuisines.
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of cuisines
   */
  async getAll(params: CuisineQueryParams): Promise<Page<Cuisine>> {
    return await this.cuisineRepository.getAllPaged(params);
  }

  /**
   * Retrieves a single cuisine by its identifier.
   *
   * @param id - Identifier of the cuisine
   * @returns The cuisine entity
   * @throws CuisineNotFoundException - If the cuisine does not exist
   */
  async getById(id: string): Promise<Cuisine> {
    const cuisine = await this.cuisineRepository.findById(id);
    if (!cuisine) throw new CuisineNotFoundException(id);
    return cuisine;
  }
}
