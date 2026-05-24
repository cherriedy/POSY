import { Injectable } from '@nestjs/common';
import { ZoneRepository } from '../../shared/repositories/zone-repository.abstract';
import { Page } from '@posy/shared';
import { Zone } from '../../shared/entities/zone';
import { ZoneNotFoundException } from '../../shared/errors/zone-not-found.exception';
import { ZoneQueryParams } from '../../shared/interfaces/zone-query-params.interface';

@Injectable()
export class GetZonesService {
  constructor(private readonly zoneRepository: ZoneRepository) {}

  async getAll(params: ZoneQueryParams): Promise<Page<Zone>> {
    return this.zoneRepository.getAllPaged(params);
  }

  async getZoneById(id: string): Promise<Zone> {
    const zone = await this.zoneRepository.findById(id);
    if (!zone) {
      throw new ZoneNotFoundException(id);
    }
    return zone;
  }
}
