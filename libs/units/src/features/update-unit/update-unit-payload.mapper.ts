import { UnitCreateRequestDto } from '../../shared/dto/unit-create-request.dto';
import { UnitUpdatePayload } from '../../shared/interfaces/unit-payloads.interface';

export class UpdateUnitPayloadMapper {
  static fromDto(this: void, dto: UnitCreateRequestDto): UnitUpdatePayload {
    return {
      name: dto.name,
      abbreviation: dto.abbreviation,
    };
  }
}
