import { Injectable } from '@nestjs/common';
import { ZoneRepository } from '../repositories/zone.repository-abstract';

@Injectable()
export class DeleteZoneService {
  constructor(private readonly zoneRepository: ZoneRepository) {}

  async deleteZone(id: string): Promise<void> {
    return await this.zoneRepository.delete(id);
  }
}
