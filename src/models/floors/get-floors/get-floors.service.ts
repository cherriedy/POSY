import { Injectable } from '@nestjs/common';
import { FloorRepository } from '../repositories/floor-repository.abstract';
import { Page } from '../../../common/interfaces/page.interface';
import { Floor } from '../types/floor.class';
import { FloorNotFoundException } from '../exceptions/floor-not-found.exception';
import { FloorQueryParams } from '../interfaces/floor-query-params.interface';

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
