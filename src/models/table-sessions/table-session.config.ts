import { Injectable } from '@nestjs/common';
import { JwtConfigService } from '../../config/jwt/config.service';
import { AppConfigService } from '../../config/app/config.service';
import { CookieOptions } from 'express';
import { JwtConfig } from '../../common/interfaces';
import { SessionPreferenceConfig } from './shared';

@Injectable()
export class TableSessionConfig {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly jwtConfigService: JwtConfigService,
  ) {}

  get cookie(): { name: string } & CookieOptions {
    const secure = this.appConfigService.env === 'production';
    return {
      name: 'session_token',
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/',
    };
  }

  get jwt(): JwtConfig {
    return {
      secret: this.jwtConfigService.tableSession,
      expiresIn: 7200, // 2 hours in seconds
    };
  }

  /** Preferences configuration for recording session user choices. */
  get preferences(): SessionPreferenceConfig {
    return {
      limits: {
        cuisines: 3,
        mealSessions: 2,
        tasteProfile: 3,
        dietaryRestrictions: 3,
      },
    };
  }
}
