import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../repositories';
import { Unit } from '../entities';
import { UnitUpdatePayload } from '../interfaces';
import { UnitNotFoundException } from '../exceptions';

@Injectable()
export class UpdateUnitService {
  constructor(private readonly unitRepository: UnitRepository) {}

  async update(id: string, payload: UnitUpdatePayload): Promise<Unit> {
    const unit = await this.unitRepository.findById(id);
    if (!unit) throw new UnitNotFoundException(id);
    return this.unitRepository.update(id, {
      name: payload.name,
      abbreviation: payload.abbreviation,
    });
  }
}
