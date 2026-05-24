import { Module } from '@nestjs/common';
import { RedisConfigService } from './config.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import Joi from '@hapi/joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
      }),
    }),
  ],
  providers: [RedisConfigService],
  exports: [RedisConfigService],
})
export class RedisConfigModule {}
