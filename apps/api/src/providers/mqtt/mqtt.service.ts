import {
  Inject,
  Injectable,
  LoggerService,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import mqtt from 'mqtt';
import { MqttConfigService } from 'src/config/mqtt/config.service';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;
  private client: mqtt.MqttClient;

  constructor(private readonly mqttConfigService: MqttConfigService) {}

  onModuleInit() {
    this.client = mqtt.connect(this.mqttConfigService.brokerUrl);

    this.client.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
    });

    this.client.on('error', (err) => {
      this.logger.error('MQTT connection error', err);
    });
  }

  onModuleDestroy() {
    this.client.end();
  }

  push(topic: string, message: string) {
    // retain ensures that the e-ink screens will receive the latest message even if they were offline when it was published
    this.client.publish(topic, message, { retain: true, qos: 1 }, (err) => {
      if (err) {
        this.logger.error(
          `Failed to publish MQTT message to topic ${topic}`,
          err,
        );
      } else {
        this.logger.log(`Published MQTT message to topic ${topic}`);
      }
    });
  }
}
