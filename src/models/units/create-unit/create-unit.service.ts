import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../repositories/unit-repository.abstract';
import { Unit } from '../entities/unit.class';
import { UnitCreatePayload } from '../interfaces/unit-payloads.interface';

@Injectable()
export class CreateUnitService {
  constructor(private readonly unitRepository: UnitRepository) {}

  async create(payload: UnitCreatePayload): Promise<Unit> {
    const unit = new Unit(undefined, payload.name, payload.abbreviation);
    return this.unitRepository.create(unit);
  }
}
