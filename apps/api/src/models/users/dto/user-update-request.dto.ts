import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IsValidPhoneNumber } from '@posy/shared';
import { IsValidRole } from '@posy/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@posy/shared';

export class UpdateUserDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Phone number of the user',
    example: '+1234567890',
  })
  @IsOptional()
  @IsValidPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Role of the user',
    example: 'STAFF',
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
