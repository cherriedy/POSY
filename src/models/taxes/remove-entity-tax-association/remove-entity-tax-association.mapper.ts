import { TaxAssociationDeleteRequestDto } from '../dto';
import { TaxAssociationBulkRemovePayload } from './remove-entity-tax-association.interface';

/**
 * Mapper class to convert a TaxAssociationDeleteRequestDto into a TaxAssociationBulkRemovePayload.
 */
export class RemoveEntityTaxAssociationMapper {
  /**
   * Converts a delete request DTO and taxId into the service-layer payload.
   *
   * @param taxId - The tax configuration ID (for context/logging in the service).
   * @param dto   - The incoming request DTO containing entity type and IDs to remove.
   * @returns A TaxAssociationBulkRemovePayload ready to be processed by the service.
   */
  static toPayload(
    taxId: string,
    dto: TaxAssociationDeleteRequestDto,
  ): TaxAssociationBulkRemovePayload {
    return {
      taxId,
      entities: dto.entities.map((entity) => ({
        type: entity.type,
        id: entity.id,
      })),
    } as TaxAssociationBulkRemovePayload;
  }
}
