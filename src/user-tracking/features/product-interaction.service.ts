import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { REDIS_INSTANCE_PROVIDER } from '../../providers/redis';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SessionProductInteractionRepository } from '../shared/repositories/spi-repository.abstract';
import { SessionProductInteraction } from '../shared';
import { ProductInteractionPayload } from '../shared/interfaces';
import Redis from 'ioredis';
import { ProductInteractionType } from '../shared/enums';
import { USER_TRACKING_CONFIG } from '../user-tracking.config';

@Injectable()
export class ProductInteractionService {
  @Inject(REDIS_INSTANCE_PROVIDER)
  private readonly redis: Redis;

  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(
    private readonly spiRepository: SessionProductInteractionRepository,
  ) {}

  /**
   * Event handler for product interaction events. Listens to all events matching the
   * pattern `interaction.product.*` and processes them asynchronously. Updates interaction
   * counts and details in Redis based on the type of interaction and sets a TTL for the stored data.
   *
   * @param payload {ProductInteractionPayload} - The payload containing details about the product interaction.
   */
  @OnEvent('interaction.product.*', { async: true })
  async handleProductInteractionEvent(payload: ProductInteractionPayload) {
    this.logger.log(
      `Received product interaction event: ${JSON.stringify(payload)}`,
    );

    try {
      const redisKey = `interaction:${payload.sessionId}:${payload.productId}`;
      const pipeline = this.redis.pipeline();

      if (payload.type === ProductInteractionType.VIEW) {
        pipeline.hincrby(redisKey, 'view_count', 1);
      } else if (payload.type === ProductInteractionType.ORDER) {
        const qty = payload.quantity || 1;
        const price = payload.price || 0;
        const spent = qty * price;

        pipeline.hincrby(redisKey, 'order_count', 1);
        pipeline.hincrby(redisKey, 'total_quantity', qty);
        pipeline.hincrbyfloat(redisKey, 'total_spent', spent);
        pipeline.hset(
          redisKey,
          'last_order',
          !payload.timestamp
            ? new Date().toISOString()
            : new Date(payload.timestamp).toISOString(),
        );
      }

      const TTL = USER_TRACKING_CONFIG.redis.TTL.product;
      pipeline.expire(redisKey, TTL); // Set the TTL for the key
      await pipeline.exec(); // Execute the pipeline
    } catch (e) {
      this.logger.error(
        `Failed to process product interaction event for session ${payload.sessionId} and product ${payload.productId}`,
        e instanceof Error ? e.stack : JSON.stringify(e),
      );
    }
  }

  /**
   * Periodically synchronizes product interaction data from Redis to the database. This method scans
   * Redis for keys matching the interaction pattern, retrieves the interaction data, and performs a
   * bulk upsert to the database. After successful persistence, it deletes the corresponding keys
   * from Redis to prevent duplicate processing.
   */
  async syncInteractionToDatabase() {
    let cursor = '0';
    let totalProcessed = 0;

    const PATTERN = USER_TRACKING_CONFIG.redis.pattern;
    const BATCH_SIZE = USER_TRACKING_CONFIG.redis.batch.size;
    const BATCH_INTERVAL = USER_TRACKING_CONFIG.redis.batch.interval;

    this.logger.log(
      'Starting periodic sync of product interactions to database',
    );

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        PATTERN,
        'COUNT',
        BATCH_SIZE.toString(),
      );

      cursor = nextCursor; // Update cursor for next iteration
      if (!keys || keys.length === 0) continue; // No keys found, skip

      const pipeline = this.redis.pipeline();
      keys.forEach((key) => pipeline.hgetall(key));
      const results = (await pipeline.exec()) as [any, any][];

      // Build domain entities for bulkUpsert
      const entities: SessionProductInteraction[] = [];
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        // Split the key to extract sessionId and productId
        // (key format: interaction:{sessionId}:{productId})
        const [, sessionId, productId] = key.split(':');

        // Extract interaction data from Redis result
        const data = results[i][1]
          ? (results[i][1] as Record<string, string>)
          : null;
        if (!data || Object.keys(data).length === 0) continue;

        const viewCount = parseInt(data.view_count || '0', 10);
        const orderCount = parseInt(data.order_count || '0', 10);
        const totalQuantity = parseInt(data.total_quantity || '0', 10);
        const totalSpent = parseFloat(data.total_spent || '0');

        entities.push(
          new SessionProductInteraction(
            null,
            sessionId,
            productId,
            viewCount,
            orderCount,
            totalQuantity,
            totalSpent,
          ),
        );
      }

      if (entities.length === 0) continue;

      try {
        // Persist the batch of interactions to the database
        await this.spiRepository.bulkUpsert(entities);

        // If successful, delete the corresponding keys from Redis
        // Use pipeline for batch deletion to optimize performance
        const delPipeline = this.redis.pipeline();
        keys.forEach((k) => delPipeline.del(k));
        await delPipeline.exec();

        totalProcessed += entities.length;
        this.logger.log(
          `Synced and cleared ${entities.length} interaction keys from Redis`,
        );
      } catch (e) {
        this.logger.error(
          `Failed to persist interactions batch.`,
          e instanceof Error ? e.stack : JSON.stringify(e),
        );
      }

      // Optional delay between batches to reduce load on Redis and the database
      if (BATCH_INTERVAL && BATCH_INTERVAL > 0) {
        await new Promise((_) => setTimeout(_, BATCH_INTERVAL));
      }
    } while (cursor !== '0');

    this.logger.log(
      `Finished sync. Total processed interactions: ${totalProcessed}`,
    );
  }
}
