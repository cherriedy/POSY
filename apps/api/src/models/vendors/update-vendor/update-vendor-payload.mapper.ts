import { VendorUpdateRequestDto } from '../dto/vendor-update-request.dto';
import { VendorUpdatePayload } from '../interfaces/vendor-payloads.interface';

export class UpdateVendorPayloadMapper {
  static fromDto(dto: VendorUpdateRequestDto): VendorUpdatePayload {
    return {
      name: dto.name,
      contactName: dto.contactName ?? null,
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      address: dto.address ?? null,
      taxCode: dto.taxCode ?? null,
      paymentTerm: dto.paymentTerm ?? null,
      note: dto.note ?? null,
      status: dto.status ?? null,
      suspendedReason: dto.suspendedReason ?? null,
      suspendedUntil: dto.suspendedUntil ?? null,
    };
  }
}
