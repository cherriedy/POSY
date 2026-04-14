export interface RedisTTLConfig {
  product: number;
  [key: string]: number;
}

export interface RedisBatchConfig {
  size: number;
  interval: number;
}

export interface RedisConfig {
  prefix: string;
  pattern: string;
  TTL: RedisTTLConfig;
  batch: RedisBatchConfig;
}

export interface UserTrackingConfig {
  redis: RedisConfig;
}
