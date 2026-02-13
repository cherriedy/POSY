import { Injectable } from '@nestjs/common';
import { TableRepository } from '../repositories';

@Injectable()
export class DeleteTableService {
  constructor(private readonly tableRepository: TableRepository) {}

  async deleteTable(id: string): Promise<void> {
    return await this.tableRepository.delete(id);
  }
}
