import { Injectable } from '@nestjs/common';
import { CuisineRepository } from '../../shared/repositories/cuisine-repository.abstract';
import { CuisineNotFoundException } from '../../shared/errors/cuisine-not-found.exception';

@Injectable()
export class DeleteCuisineService {
  constructor(private readonly cuisineRepository: CuisineRepository) {}

  async delete(id: string): Promise<void> {
    const cuisine = await this.cuisineRepository.findById(id);
    if (!cuisine) throw new CuisineNotFoundException(id);
    await this.cuisineRepository.delete(id);
  }
}
