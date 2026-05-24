import { UnitCreateRequestDto } from '../../shared/dto/unit-create-request.dto';
import { UnitCreatePayload } from '../../shared/interfaces/unit-payloads.interface';

export class CreateUnitPayloadMapper {
  static fromDto(this: void, dto: UnitCreateRequestDto): UnitCreatePayload {
    return {
      name: dto.name,
      abbreviation: dto.abbreviation,
    };
  }
}
