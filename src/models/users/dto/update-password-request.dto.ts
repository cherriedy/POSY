import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidPassword, Match } from '../../../common/decorators';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
<<<<<<< HEAD:src/models/users/dto/update-password.dto.ts
=======
  @ApiProperty({
    type: String,
    description: 'User ID',
    example: 'c1a2b3d4-5678-90ab-cdef-1234567890ab',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    type: String,
    description: 'New password',
    example: 'StrongPassword123!',
  })
>>>>>>> db13a8f43cb27deeaed7143bd11a9d1a336114d5:src/models/users/dto/update-password-request.dto.ts
  @IsValidPassword()
  newPassword: string;

  @ApiProperty({
    type: String,
    description: 'Password confirmation',
    example: 'StrongPassword123!',
  })
  @IsString()
  @IsNotEmpty()
  @Match('newPassword', { message: 'Password confirmation does not match' })
  newPasswordConfirmation: string;
}
