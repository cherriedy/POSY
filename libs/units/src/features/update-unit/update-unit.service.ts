import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../../shared/repositories/unit-repository.abstract';
import { Unit } from '../../shared/entities/unit';
import { UnitUpdatePayload } from '../../shared/interfaces/unit-payloads.interface';
import { UnitNotFoundException } from '../../shared/errors/unit-not-found.exception';

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
