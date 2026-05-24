import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../../shared/repositories/unit-repository.abstract';
import { UnitNotFoundException } from '../../shared/errors/unit-not-found.exception';

@Injectable()
export class DeleteUnitService {
  constructor(private readonly unitRepository: UnitRepository) {}

  async delete(id: string): Promise<void> {
    const unit = await this.unitRepository.findById(id);
    if (!unit) throw new UnitNotFoundException(id);
    return this.unitRepository.delete(id);
  }
}
