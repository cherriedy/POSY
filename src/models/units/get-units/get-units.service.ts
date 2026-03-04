import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../repositories';
import { Unit } from '../entities';
import { UnitNotFoundException } from '../exceptions';
import { Page } from '../../../common/interfaces';
import { UnitQueryParams } from '../interfaces';

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
