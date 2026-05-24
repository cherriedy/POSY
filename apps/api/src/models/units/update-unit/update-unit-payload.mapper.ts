import { UnitCreateRequestDto } from '../dto/unit-create-request.dto';
import { UnitUpdatePayload } from '../interfaces/unit-payloads.interface';

export class UpdateUnitPayloadMapper {
  static fromDto(this: void, dto: UnitCreateRequestDto): UnitUpdatePayload {
    return {
      name: dto.name,
      abbreviation: dto.abbreviation,
    };
  }
}
