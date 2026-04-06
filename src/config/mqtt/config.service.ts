import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MqttConfigService {
  constructor(private readonly configService: ConfigService) {}

  get brokerUrl(): string {
    return this.configService.get<string>('mqtt.brokerUrl')!;
  }
}


