import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MomoConfigService {
  constructor(private readonly configService: ConfigService) {}

  get partnerCode(): string {
    return this.configService.get<string>('momo.partner_code')!;
  }

  get accessKey(): string {
    return this.configService.get<string>('momo.access_key')!;
  }

  get secretKey(): string {
    return this.configService.get<string>('momo.secret_key')!;
  }

  get redirectUrl(): string {
    return this.configService.get<string>('momo.redirect_url')!;
  }

  get ipnUrl(): string {
    return this.configService.get<string>('momo.ipn_url')!;
  }
}
