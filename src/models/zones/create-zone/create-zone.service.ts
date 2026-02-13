import { Injectable } from '@nestjs/common';
import { ZoneRepository } from '../repositories';
import { Zone } from '../types';

@Injectable()
export class CreateZoneService {
  constructor(private readonly zoneRepository: ZoneRepository) {}
  /**
   * Creates a new zone using the provided zone data.
   *
   * This method delegates the creation logic to the ZoneRepository, which handles
   * the actual persistence of the zone entity. It returns the created zone object.
   *
   * @param zone - The zone entity to be created. Should contain all required fields for creation.
   * @returns A promise that resolves to the created Zone object.
   * @throws DuplicateEntryException if a zone with a unique field already exists (from repository layer).
   * @throws RelatedRecordNotFoundException if a related record is not found (from repository layer).
   */
  async createZone(zone: Zone): Promise<Zone> {
    return await this.zoneRepository.create(zone);
  }
}
