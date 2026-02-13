import { Injectable } from '@nestjs/common';
import { ZoneRepository } from '../repositories';
import { Zone } from '../types';
@Injectable()
export class UpdateZoneService {
  constructor(private readonly zoneRepository: ZoneRepository) {}
  async updateZone(id: string, zone: Partial<Zone>): Promise<Zone> {
    return await this.zoneRepository.update(id, zone);
  }
}
