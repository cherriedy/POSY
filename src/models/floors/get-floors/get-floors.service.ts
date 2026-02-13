import { Injectable } from '@nestjs/common';
import { FloorRepository } from '../repositories';
import { Page } from '../../../common/interfaces';
import { Floor } from '../types';
import { FloorNotFoundException } from '../exceptions';
import { FloorQueryParams } from '../interfaces';

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
