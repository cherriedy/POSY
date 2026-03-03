import { Injectable } from '@nestjs/common';
import { ZoneRepository } from '../repositories';
import { Zone } from '../types';
import { FloorRepository } from 'src/models/floors/repositories';
import { RelatedRecordNotFoundException } from 'src/common/exceptions';
import { ZoneNotFoundException } from '../exceptions';

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
