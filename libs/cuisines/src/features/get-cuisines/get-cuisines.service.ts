import { Injectable } from '@nestjs/common';
import { CuisineRepository } from '../../shared/repositories/cuisine-repository.abstract';
import { Cuisine } from '../../shared/entities/cuisine';
import { CuisineQueryParams } from '../../shared/interfaces/cuisine-query-params.interface';
import { Page } from '@posy/shared';
import { CuisineNotFoundException } from '../../shared/errors/cuisine-not-found.exception';

@Injectable()
export class GetCuisinesService {
  constructor(private readonly cuisineRepository: CuisineRepository) {}

  async getAll(params: CuisineQueryParams): Promise<Page<Cuisine>> {
    return await this.cuisineRepository.getAllPaged(params);
  }

  async getById(id: string): Promise<Cuisine> {
    const cuisine = await this.cuisineRepository.findById(id);
    if (!cuisine) throw new CuisineNotFoundException(id);
    return cuisine;
  }
}
