import { Injectable } from '@nestjs/common';
import { CuisineRepository } from '../repositories';

/**
 * Service responsible for soft-deleting cuisines.
 */
@Injectable()
export class DeleteCuisineService {
  constructor(private readonly cuisineRepository: CuisineRepository) {}

  /**
   * Soft-deletes a cuisine by its identifier by setting the is_deleted flag to true.
   *
   * @param id - Identifier of the cuisine to delete
   * @throws CuisineNotFoundException - If the cuisine does not exist or is already deleted
   *
   * @remarks
   * This method performs a soft delete, meaning the cuisine record remains in the database
   * but is marked as deleted. The isDeleted property is set to true and deletedAt is set
   * to the current timestamp instead of removing the record permanently.
   */
  async delete(id: string): Promise<void> {
    await this.cuisineRepository.delete(id);
  }
}
