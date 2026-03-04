import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../repositories';
import { Unit } from '../entities';
import { UnitCreatePayload } from '../interfaces';

@Injectable()
export class CreateUnitService {
  constructor(private readonly unitRepository: UnitRepository) {}

  async create(payload: UnitCreatePayload): Promise<Unit> {
    const unit = new Unit(undefined, payload.name, payload.abbreviation);
    return this.unitRepository.create(unit);
  }
}
