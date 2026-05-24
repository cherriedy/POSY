import { Injectable } from '@nestjs/common';
import { ZoneRepository } from '../../shared/repositories/zone-repository.abstract';
import { Zone } from '../../shared/entities/zone';
import { FloorRepository } from 'src/models/floors/repositories/floor-repository.abstract';
import { RelatedRecordNotFoundError } from '@posy/shared';

@Injectable()
export class CreateZoneService {
  constructor(
    private readonly zoneRepository: ZoneRepository,
    private readonly floorRepository: FloorRepository,
  ) {}
  /**
   * Creates a new zone using the provided zone data.
   *
   * This method delegates the creation logic to the ZoneRepository, which handles
   * the actual entities of the zone entity. It returns the created zone object.
   *
   * @param zone - The zone entity to be created. Should contain all required fields for creation.
   * @returns A promise that resolves to the created Zone object.
   * @throws DuplicateEntryError if a zone with a unique field already exists (from repository layer).
   * @throws RelatedRecordNotFoundError if a related record is not found (from repository layer).
   */
  async createZone(zone: Zone): Promise<Zone> {
    const floor = await this.floorRepository.findById(zone.floorId);

    if (!floor) {
      throw new RelatedRecordNotFoundError(
        `Floor with id ${zone.floorId} not found`,
      );
    }
    return await this.zoneRepository.create(zone);
  }
}
