import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { IsValidPhoneNumber } from '../../../common/decorators/is-valid-phone-number.decorator';
import { IsValidRole } from '../../../common/decorators/is-valid-role.decorator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'fullName must be at least 2 characters long.' })
  @MaxLength(100, { message: 'fullName must be at most 100 characters long.' })
  fullName?: string;

  @IsOptional()
  @IsValidPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsValidRole()
  role?: string;
}
