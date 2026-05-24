import { VendorCreateRequestDto } from '../../shared/dto/vendor-create-request.dto';
import { VendorCreatePayload } from '../../shared/interfaces/vendor-payloads.interface';

export class CreateVendorPayloadMapper {
  static fromDto(dto: VendorCreateRequestDto): VendorCreatePayload {
    return {
      name: dto.name,
      contactName: dto.contactName,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      taxCode: dto.taxCode,
      paymentTerm: dto.paymentTerm,
      note: dto.note,
      status: dto.status,
    };
  }
}
