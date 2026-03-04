import { Injectable } from '@nestjs/common';
import { UnitRepository } from '../repositories';

@Injectable()
export class DeleteUnitService {
  constructor(private readonly unitRepository: UnitRepository) {}

  async delete(id: string): Promise<void> {
    return this.unitRepository.delete(id);
  }
}
