import { Injectable } from '@nestjs/common';
import { ZoneRepository } from '../repositories';
import { Page } from '../../../common/interfaces';
import { Zone } from '../types';
import { ZoneNotFoundException } from '../exceptions';
import { ZoneQueryParams } from '../interfaces';
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
