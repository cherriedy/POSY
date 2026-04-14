import { Module } from '@nestjs/common';
import { MqttConfigService } from './config.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import Joi from '@hapi/joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        MQTT_BROKER_URL: Joi.string().default('mqtt://localhost:1883'),
      }),
    }),
  ],
  providers: [MqttConfigService],
  exports: [MqttConfigService],
})
export class MqttConfigModule {}
