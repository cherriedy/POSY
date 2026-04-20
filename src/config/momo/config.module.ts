import { Module } from '@nestjs/common';
import { MomoConfigService } from './config.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import Joi from '@hapi/joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        MOMO_PARTNER_CODE: Joi.string().required(),
        MOMO_ACCESS_KEY: Joi.string().required(),
        MOMO_SECRET_KEY: Joi.string().required(),
        MOMO_REDIRECT_URL: Joi.string().uri().required(),
        MOMO_IPN_URL: Joi.string().uri().required(),
      }),
    }),
  ],
  providers: [MomoConfigService],
  exports: [MomoConfigService],
})
export class MomoConfigModule {}
