import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../repositories/unit-repository.abstract';
import { UnitNotFoundException } from '../exceptions/unit-not-found.exception';

@Injectable()
export class DeleteUnitService {
  constructor(private readonly unitRepository: UnitRepository) {}

  async delete(id: string): Promise<void> {
    const unit = await this.unitRepository.findById(id);
    if (!unit) throw new UnitNotFoundException(id);
    return this.unitRepository.delete(id);
  }
}
