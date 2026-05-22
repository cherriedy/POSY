import { Injectable } from '@nestjs/common';
import { ZoneRepository } from '../repositories/zone.repository-abstract';
import { Page } from '../../../common/interfaces/page.interface';
import { Zone } from '../types/zone.class';
import { ZoneNotFoundException } from '../exceptions/zone-not-found.exception';
import { ZoneQueryParams } from '../interfaces/zone-query-params.interface';
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
