import { Injectable } from '@nestjs/common';
import { FloorRepository } from '../repositories/floor-repository.abstract';
import { Floor } from '../types/floor';

@Injectable()
export class UpdateFloorService {
  constructor(private readonly floorRepository: FloorRepository) {}

  async updateFloor(id: string, floor: Partial<Floor>): Promise<Floor> {
    return await this.floorRepository.update(id, floor);
  }
}
