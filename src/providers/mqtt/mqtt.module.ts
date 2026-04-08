import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { MqttConfigModule } from '../../config/mqtt/config.module';

@Module({
  imports: [MqttConfigModule],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
