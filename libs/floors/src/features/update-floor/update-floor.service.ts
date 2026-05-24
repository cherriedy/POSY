import { Injectable } from '@nestjs/common';
import { FloorRepository } from '../../shared/repositories/floor-repository.abstract';
import { Floor } from '../../shared/entities/floor';

@Injectable()
export class UpdateFloorService {
  constructor(private readonly floorRepository: FloorRepository) {}

  async updateFloor(id: string, floor: Partial<Floor>): Promise<Floor> {
    return await this.floorRepository.update(id, floor);
  }
}
