import { Injectable } from '@nestjs/common';
import { FloorRepository } from '../repositories';
import { Floor } from '../types';

@Injectable()
export class CreateFloorService {
  constructor(private readonly floorRepository: FloorRepository) {}
  /**
   * Creates a new floor using the provided floor data.
   *
   * This method delegates the creation logic to the FloorRepository, which handles
   * the actual persistence of the floor entity. It returns the created floor object.
   *
   * @param floor - The floor entity to be created. Should contain all required fields for creation.
   * @returns A promise that resolves to the created Floor object.
   * @throws DuplicateEntryException if a floor with a unique field already exists (from repository layer).
   * @throws RelatedRecordNotFoundException if a related record is not found (from repository layer).
   */
  async createFloor(floor: Floor): Promise<Floor> {
    return await this.floorRepository.create(floor);
  }
}
