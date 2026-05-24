import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ValidateResetCodeDto } from './dto/validate-reset-code.dto';
import { Request, Response } from 'express';
import { DeviceContext } from '../common/interfaces/device-context.interface';
import { SignInService } from './sign-in/sign-in.service';
import { ForgetPasswordService } from './forget-password/forget-password.service';
import { ValidateResetCodeService } from './validate-reset-code/validate-reset-code.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ResetTokenSchema } from './interfaces/reset-token-schema.interface';
import { ResetPasswordService } from './reset-password/reset-password.service';
import { RefreshAccessTokenService } from './refresh-access-token/refresh-access-token.service';
import { AppConfigService } from '../config/app/config.service';
import { LogOutService } from './log-out/log-out.service';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { authConfig } from './auth.config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

const { limit, ttl } = authConfig.throttle;

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private appConfigService: AppConfigService,
    private signInService: SignInService,
    private forgetPasswordService: ForgetPasswordService,
    private validateResetCodeService: ValidateResetCodeService,
    private resetPasswordService: ResetPasswordService,
    private refreshAccessTokenService: RefreshAccessTokenService,
    private logoutService: LogOutService,
  ) {}

  @Post('signin')
  @Throttle({ default: { limit, ttl } })
  @ApiOperation({
    summary: 'Sign in',
    description:
      'Authenticate user and return access token. Sets refresh token as HttpOnly cookie.',
  })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    description: 'Access token and expiration',
    schema: {
      example: { access_token: 'jwt', expires_in: 3600 },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account locked' })
  async signin(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, expires_in } =
      await this.signInService.signin(dto);

    const env = this.appConfigService.env;
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: env === 'production',
      sameSite: 'lax',
      path: '/auth/refresh',
    });

    return { access_token, expires_in };
  }

  @Post('forgot-password')
  @Throttle({ default: { limit, ttl } })
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Send password reset link to user email if it exists.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset link sent',
    schema: {
      example: {
        message: 'If the email exists, a password reset link has been sent.',
      },
    },
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    const deviceContext: DeviceContext = {
      date: req['date'] as string,
      device: req['device'] as string,
      location: req['location'] as string,
    };

    await this.forgetPasswordService.forgotPassword(
      dto.email,
      'Password Reset Request',
      deviceContext,
    );
    return {
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  @Post('validate-reset-code')
  @Throttle({ default: { limit, ttl } })
  @ApiOperation({
    summary: 'Validate reset code',
    description: 'Validate the password reset code and return a reset token.',
  })
  @ApiBody({ type: ValidateResetCodeDto })
  @ApiResponse({
    status: 200,
    description: 'Reset token',
    schema: {
      example: { reset_token: 'token' },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired reset code' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async validateResetCode(
    @Body() dto: ValidateResetCodeDto,
  ): Promise<ResetTokenSchema> {
    return await this.validateResetCodeService.validateResetCode(dto);
  }

  @Post('reset-password')
  @Throttle({ default: { limit, ttl } })
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset user password using a valid reset token.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    schema: {
      example: { message: 'The password has been successfully reset.' },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired reset token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.resetPasswordService.resetPassword(dto);
    return { message: 'The password has been successfully reset.' };
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Refresh JWT access token using HttpOnly cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'New access token and expiration',
    schema: {
      example: { access_token: 'jwt', expires_in: 3600 },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Refresh token not found in cookies',
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async refreshAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refresh_token = req.cookies?.refresh_token as string;
    if (!refresh_token) {
      throw new BadRequestException('Refresh token not found in cookies.');
    }

    const {
      access_token,
      refresh_token: new_refresh_token,
      expires_in,
    } = await this.refreshAccessTokenService.refreshAccessToken(refresh_token);

    const env = this.appConfigService.env;
    res.cookie('refresh_token', new_refresh_token, {
      httpOnly: true,
      secure: env === 'production',
      sameSite: 'lax',
      path: '/auth/refresh',
    });

    return { access_token, expires_in };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Logout',
    description: 'Logout user and clear refresh token cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      example: { success: true },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userId = (req.user as JwtPayload).sub;
    await this.logoutService.logout(userId);

    const env = this.appConfigService.env;
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: env === 'production',
      sameSite: 'lax',
      path: '/auth/refresh',
    });

    return { success: true };
  }
}
