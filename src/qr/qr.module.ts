import { Module } from '@nestjs/common';
import { MqttModule } from '../providers/mqtt/mqtt.module';
import { QrService } from './qr.service';
import { AppConfigModule } from '../config';
import { TableModule } from '../models/tables/table.module';
import { QrController } from './qr.controller';

@Module({
  imports: [AppConfigModule, MqttModule, TableModule],
  providers: [QrService],
  exports: [QrService],
  controllers: [QrController],
})
export class QrModule {}
