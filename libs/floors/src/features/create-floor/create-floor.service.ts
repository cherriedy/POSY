import { Injectable } from '@nestjs/common';
import { FloorRepository } from '../../shared/repositories/floor-repository.abstract';
import { Floor } from '../../shared/entities/floor';

@Injectable()
export class CreateFloorService {
  constructor(private readonly floorRepository: FloorRepository) {}

  async createFloor(floor: Floor): Promise<Floor> {
    return await this.floorRepository.create(floor);
  }
}
