import { Injectable } from '@nestjs/common';
import { FloorRepository } from '../../shared/repositories/floor-repository.abstract';
import { Page } from '@posy/shared';
import { Floor } from '../../shared/entities/floor';
import { FloorNotFoundException } from '../../shared/errors/floor-not-found.exception';
import { FloorQueryParams } from '../../shared/interfaces/floor-query-params.interface';

@Injectable()
export class GetFloorsService {
  constructor(private readonly floorRepository: FloorRepository) {}

  async getAll(params: FloorQueryParams): Promise<Page<Floor>> {
    return this.floorRepository.getAllPaged(params);
  }

  async getFloorById(id: string): Promise<Floor> {
    const floor = await this.floorRepository.findById(id);
    if (!floor) {
      throw new FloorNotFoundException(id);
    }
    return floor;
  }
}
