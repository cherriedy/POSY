import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../repositories';
import { Unit } from '../entities';
import { UnitUpdatePayload } from '../interfaces';

@Injectable()
export class UpdateUnitService {
  constructor(private readonly unitRepository: UnitRepository) {}

  async update(id: string, payload: UnitUpdatePayload): Promise<Unit> {
    return this.unitRepository.update(id, {
      name: payload.name,
      abbreviation: payload.abbreviation,
    });
  }
}
