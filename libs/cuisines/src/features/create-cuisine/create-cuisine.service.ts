import { Injectable } from '@nestjs/common';
import { CuisineRepository } from '../../shared/repositories/cuisine-repository.abstract';
import { Cuisine } from '../../shared/entities/cuisine';
import { CuisineInsertPayload } from '../../shared/interfaces/cuisine-payloads.interface';

@Injectable()
export class CreateCuisineService {
  constructor(private readonly cuisineRepository: CuisineRepository) {}

  async create(payload: CuisineInsertPayload): Promise<Cuisine> {
    return await this.cuisineRepository.create(payload as Cuisine);
  }
}
