import { PartialType } from '@nestjs/mapped-types';
import { VendorCreateRequestDto } from './vendor-create-request.dto';

export class VendorUpdateRequestDto extends PartialType(
  VendorCreateRequestDto,
) {}
