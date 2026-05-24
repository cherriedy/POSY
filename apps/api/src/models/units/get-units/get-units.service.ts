import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../repositories/unit-repository.abstract';
import { Unit } from '../entities/unit';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';
import { Page } from '../../../common/interfaces/page.interface';
import { UnitQueryParams } from '../interfaces/unit-query-params.interface';

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
