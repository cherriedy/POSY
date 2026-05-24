import { Module } from '@nestjs/common';
import { MqttModule } from '@posy/shared';
import { QrService } from './qr.service';
import { AppConfigModule } from '@posy/shared';
import { TableModule } from '../models/tables/table.module';
import { QrController } from './qr.controller';

@Module({
  imports: [AppConfigModule, MqttModule, TableModule],
  providers: [QrService],
  exports: [QrService],
  controllers: [QrController],
})
export class QrModule {}
