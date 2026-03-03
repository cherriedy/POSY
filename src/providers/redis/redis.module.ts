import { LoggerService, Module } from '@nestjs/common';
import { RedisConfigService } from '../../config/redis/config.service';
import { RedisConfigModule } from '../../config';
import Redis from 'ioredis';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Module({
  imports: [RedisConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (
        redisConfigService: RedisConfigService,
        logger: LoggerService,
      ) => {
        const redis = new Redis({
          host: redisConfigService.host,
          port: redisConfigService.port,
          retryStrategy(times) {
            // Reconnection attempts with a maximum delay of 2 seconds
            return Math.min(times * 50, 2000);
          },
        });

        redis.on('connect', () => {
          logger.log('Redis connected');
        });
        redis.on('ready', () => {
          logger.log('Redis ready');
        });
        redis.on('error', (err) => {
          logger.error('Redis error', err.stack);
        });
        redis.on('reconnecting', () => {
          logger.warn('Redis reconnecting...');
        });

        return redis;
      },
      inject: [RedisConfigService, WINSTON_MODULE_NEST_PROVIDER],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
