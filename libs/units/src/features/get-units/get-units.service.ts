import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../../shared/repositories/unit-repository.abstract';
import { Unit } from '../../shared/entities/unit';
import { UnitNotFoundException } from '../../shared/errors/unit-not-found.exception';
import { Page } from '@posy/shared';
import { UnitQueryParams } from '../../shared/interfaces/unit-query-params.interface';

@Injectable()
export class GetUnitsService {
  constructor(private readonly unitRepository: UnitRepository) {}

  async getAllPaged(params: UnitQueryParams): Promise<Page<Unit>> {
    return await this.unitRepository.getAllPaged(params);
  }

  async getById(id: string): Promise<Unit> {
    const unit = await this.unitRepository.findById(id);
    if (!unit) throw new UnitNotFoundException(id);
    return unit;
  }
}
