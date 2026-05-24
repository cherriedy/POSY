import { Injectable } from '@nestjs/common';
import { CuisineRepository } from '../../shared/repositories/cuisine-repository.abstract';
import { Cuisine } from '../../shared/entities/cuisine';
import { CuisineUpdatePayload } from '../../shared/interfaces/cuisine-payloads.interface';
import { CuisineNotFoundException } from '../../shared/errors/cuisine-not-found.exception';

@Injectable()
export class UpdateCuisineService {
  constructor(private readonly cuisineRepository: CuisineRepository) {}

  async update(id: string, payload: CuisineUpdatePayload): Promise<Cuisine> {
    const cuisine = await this.cuisineRepository.findById(id);
    if (!cuisine) throw new CuisineNotFoundException(id);
    return await this.cuisineRepository.update(id, payload as Partial<Cuisine>);
  }
}
