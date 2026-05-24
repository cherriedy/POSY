import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUsersService } from '../models/users/get-users/get-users.service';
import { UpdateUserService } from '../models/users/update-user/update-user.service';
import { UpdatePasswordDto } from '../models/users/dto/update-password-request.dto';
import { UpdateUserDto } from '../models/users/dto/user-update-request.dto';
import { UserDetailedResponseDto } from '../models/users/dto/user-detailed-response.dto';
import { JwtPayload } from '@posy/auth';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('My Profile')
@ApiBearerAuth()
@Controller('my-profile')
@UseGuards(AuthGuard('jwt'))
export class MyProfileController {
  constructor(
    private readonly getUsersService: GetUsersService,
    private readonly updateUserService: UpdateUserService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get my profile',
    description:
      'Returns detailed information about the authenticated user profile.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile details',
    type: UserDetailedResponseDto,
  })
  async getProfile(@Req() req: Request): Promise<UserDetailedResponseDto> {
    const userId = (req.user as JwtPayload).sub;
    const user = await this.getUsersService.getUserById(userId);
    return plainToInstance(UserDetailedResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Put()
  @ApiOperation({
    summary: 'Update my profile',
    description:
      'Updates the authenticated user profile with the provided details.',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Updated user profile',
    type: UserDetailedResponseDto,
  })
  async updateProfile(
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ): Promise<UserDetailedResponseDto> {
    const userId = (req.user as JwtPayload).sub;
    const updatedUser = await this.updateUserService.updateUser(userId, dto);
    return plainToInstance(UserDetailedResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  @Put('change-password')
  @ApiOperation({
    summary: 'Change my password',
    description:
      'Changes the password for the authenticated user. Requires current authentication.',
  })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: { example: { message: 'Password changed successfully' } },
  })
  async changePassword(
    @Body() dto: UpdatePasswordDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const userId = (req.user as JwtPayload).sub;
    await this.updateUserService.updatePassword(userId, dto.newPassword);
    return { message: 'Password changed successfully' };
  }
}
