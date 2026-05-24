import { registerAs } from '@nestjs/config';

export default registerAs('mqtt', () => ({
  brokerUrl: process.env.MQTT_BROKER_URL,
}));
