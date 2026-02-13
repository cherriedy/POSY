import { Table } from '../types';
import { BaseRepository, Page } from '../../../common/interfaces';
import { TableQueryParams } from '../interfaces';

export abstract class TableRepository implements BaseRepository<Table> {
  /**
   * Creates a new table in the repository.
   * @param entity - The table entity to create.
   * @returns A promise that resolves to the created table.
   */
  abstract create(entity: Table): Promise<Table>;

  /**
   * Finds a table by its unique identifier.
   * @param id - The unique identifier of the table to find.
   * @returns A promise that resolves to the found table or null if not found.
   */
  abstract findById(id: string): Promise<Table | null>;

  /**
   * Deletes a table by its unique identifier.
   * @param id - The unique identifier of the table to delete.
   * @returns A promise that resolves when the table is deleted.
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Updates an existing table by its unique identifier.
   * @param id - The unique identifier of the table to update.
   * @param entity - Partial data to update the table with.
   * @returns A promise that resolves to the updated table.
   */
  abstract update(id: string, entity: Partial<Table>): Promise<Table>;

  /**
   * Retrieves a paginated list of tables based on query parameters.
   * @param params - The query parameters for pagination, filtering, and sorting.
   * @returns A promise that resolves to a paginated list of tables.
   */
  abstract getAllPaged(params: TableQueryParams): Promise<Page<Table>>;
}
