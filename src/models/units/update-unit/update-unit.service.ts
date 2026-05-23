import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../repositories/unit-repository.abstract';
import { Unit } from '../entities/unit';
import { UnitUpdatePayload } from '../interfaces/unit-payloads.interface';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';

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
