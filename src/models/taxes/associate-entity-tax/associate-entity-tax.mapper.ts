import { TaxAssociationBulkUpsertRequestDto } from '../dto';
import { TaxAssociationBulkUpsertPayload } from './associate-entity-tax.interface';

/**
 * Mapper class to convert between TaxAssociationBulkUpsertRequestDto and TaxAssociationBulkUpsertPayload.
 * This is used to transform incoming API request data into the format expected by the service layer.
 */
export class AssociateEntityTaxMapper {
  /**
   * Converts a TaxAssociationBulkUpsertRequestDto and taxId into a TaxAssociationBulkUpsertPayload.
   *
   * @param taxId - The identifier of the tax to associate with the entities.
   * @param dto - The incoming request DTO containing the entities to associate and their details.
   * @return A TaxAssociationBulkUpsertPayload ready to be processed by the service layer.
   *
   * @remarks
   * This method maps each item in the request DTO to the corresponding format in the payload,
   * ensuring that the entity reference, active status, and notes are correctly transferred.
   */
  static toPayload(
    taxId: string,
    dto: TaxAssociationBulkUpsertRequestDto,
  ): TaxAssociationBulkUpsertPayload {
    return {
      taxId,
      items: dto.items.map((i) => {
        return {
          entityRef: {
            id: i.entityRef.id,
            type: i.entityRef.type,
          },
          isActive: i.isActive,
          note: i.note,
        };
      }) as TaxAssociationBulkUpsertPayload['items'],
    };
  }
}
