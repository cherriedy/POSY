import { UnitCreateRequestDto } from '../dto';
import { UnitUpdatePayload } from '../interfaces';

export class UpdateUnitPayloadMapper {
  static fromDto(this: void, dto: UnitCreateRequestDto): UnitUpdatePayload {
    return {
      name: dto.name,
      abbreviation: dto.abbreviation,
    };
  }
}
