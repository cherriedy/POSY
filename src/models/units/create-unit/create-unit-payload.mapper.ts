import { UnitCreateRequestDto } from '../dto';
import { UnitCreatePayload } from '../interfaces';

export class CreateUnitPayloadMapper {
  static fromDto(this: void, dto: UnitCreateRequestDto): UnitCreatePayload {
    return {
      name: dto.name,
      abbreviation: dto.abbreviation,
    };
  }
}
