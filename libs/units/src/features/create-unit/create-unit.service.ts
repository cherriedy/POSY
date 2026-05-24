import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../../shared/repositories/unit-repository.abstract';
import { Unit } from '../../shared/entities/unit';
import { UnitCreatePayload } from '../../shared/interfaces/unit-payloads.interface';

@Injectable()
export class CreateUnitService {
  constructor(private readonly unitRepository: UnitRepository) {}

  async create(payload: UnitCreatePayload): Promise<Unit> {
    const unit = new Unit(undefined, payload.name, payload.abbreviation);
    return this.unitRepository.create(unit);
  }
}
