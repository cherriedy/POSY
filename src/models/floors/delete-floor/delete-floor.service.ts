import { Injectable } from '@nestjs/common';
import { FloorRepository } from '../repositories';

@Injectable()
export class DeleteFloorService {
  constructor(private readonly floorRepository: FloorRepository) {}

  async deleteFloor(id: string): Promise<void> {
    return await this.floorRepository.delete(id);
  }
}
