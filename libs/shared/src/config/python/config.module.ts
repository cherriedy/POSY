import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PythonConfigService } from './config.service';
import configuration from './configuration';
import Joi from '@hapi/joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        PYTHON_URL: Joi.string().uri().required(),
      }),
    }),
  ],
  providers: [PythonConfigService],
  exports: [PythonConfigService],
})
export class PythonConfigModule {}
