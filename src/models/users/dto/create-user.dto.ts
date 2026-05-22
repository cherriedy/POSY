import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsValidPassword } from '../../../common/decorators/is-valid-password.decorator';
import { IsValidPhoneNumber } from '../../../common/decorators/is-valid-phone-number.decorator';
import { IsValidRole } from '../../../common/decorators/is-valid-role.decorator';
import { Role } from 'src/common/enums/role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @IsValidPassword()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsValidPhoneNumber()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'FullName must be at least 2 characters long.' })
  @MaxLength(100, { message: 'FullName must be at most 100 characters long.' })
  fullName: string;

  @IsString()
  @IsEnum(Role)
  role: Role.STAFF;

  @IsBoolean()
  isActive: boolean = true;
}
