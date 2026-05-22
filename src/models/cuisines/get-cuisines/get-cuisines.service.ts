import { Injectable } from '@nestjs/common';
import { CuisineRepository } from '../repositories/cuisine.repository-abstract';
import { Cuisine } from '../types/cuisine.class';
import { CuisineQueryParams } from '../interfaces/cuisine-query-params.interface';
import { Page } from '../../../common/interfaces/page.interface';
import { CuisineNotFoundException } from '../exceptions/cuisine-not-found.exception';

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
