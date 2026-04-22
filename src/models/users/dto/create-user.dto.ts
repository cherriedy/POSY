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
import {
  IsValidPassword,
  IsValidPhoneNumber,
  IsValidRole,
} from '../../../common/decorators';
import { Role } from 'src/common/enums';

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
