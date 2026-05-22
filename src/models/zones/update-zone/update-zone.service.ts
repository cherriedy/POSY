import { Injectable } from '@nestjs/common';
import { ZoneRepository } from '../repositories/zone.repository-abstract';
import { Zone } from '../types/zone.class';
import { FloorRepository } from 'src/models/floors/repositories/floor.repository-abstract';
import { RelatedRecordNotFoundException } from 'src/common/exceptions/RelatedRecordNotFoundException';
import { ZoneNotFoundException } from '../exceptions/zone-not-found.exception';

@Injectable()
export class UpdateZoneService {
  constructor(
    private readonly zoneRepository: ZoneRepository,
    private readonly floorRepository: FloorRepository,
  ) {}
  async updateZone(id: string, zone: Partial<Zone>): Promise<Zone> {
    const existingZone = await this.zoneRepository.findById(id);

    if (!existingZone) {
      throw new ZoneNotFoundException(id);
    }

    if (zone.floorId) {
      const floor = await this.floorRepository.findById(zone.floorId);

      if (!floor) {
        throw new RelatedRecordNotFoundException(
          `Floor with id ${zone.floorId} not found`,
        );
      }
    }

    return await this.zoneRepository.update(id, zone);
  }
}
