import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PythonConfigService } from '../config/python/config.service';
import { OnEvent } from '@nestjs/event-emitter';
import { lastValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CollaborativeResponse } from './recommendation.type';
import { ProductRepository } from '../models/products/repositories/product-repository.abstract';
import { Product } from '../models/products';

@Injectable()
export class RecommendationService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly productRepository: ProductRepository,
    pythonConfigService: PythonConfigService,
  ) {
    this.baseUrl = pythonConfigService.url;
  }

  /**
   * Synchronizes product changes with the recommendation engine.
   *
   * This event handler listens for product lifecycle events and notifies the external
   * Python recommendation service to update its model. It ensures that new or modified
   * products are immediately factored into recommendation algorithms.
   *
   * @param payload - The event data
   * @param payload.id - The UUID of the product that was created or updated
   *
   * @remarks
   * The request is sent to the `/api` endpoint of the configured `baseUrl`.
   * It performs a partial recalculation by setting `force_recalculate_all` to `false`.
   *
   * @throws Will log an error but not rethrow if the HTTP request fails, to prevent
   * event loop blocking or event handler crashes.
   */
  @OnEvent('product.created')
  @OnEvent('product.updated')
  async handleProductChangedEvent(payload: { id: string }) {
    this.logger.log(
      `Received product change event for product ID:) ${payload.id}`,
    );

    try {
      const url = `${this.baseUrl}/api/recommend/content-based`;
      const requestBody = {
        product_id: payload.id,
        force_recalculate_all: false,
      };
      const response = await lastValueFrom(
        this.httpService.post(url, requestBody),
      );
      if (response.status === 200) {
        this.logger.log(
          `Successfully triggered recommendation recalculation for product ID: ${payload.id}`,
        );
      }
    } catch (e) {
      this.logger.error(
        `Failed to trigger recommendation recalculation for product ID: ${payload.id}`,
        e instanceof Error ? e.stack : null,
      );
    }
  }

  /**
   * Performs a full retraining of the collaborative filtering model on a daily basis.
   *
   * This scheduled task runs every day at 2 AM and sends a request to the external
   * Python recommendation service to perform a complete retraining of the collaborative
   * filtering model. This ensures that the model stays up-to-date with the latest user
   * interactions and product data, improving recommendation accuracy over time.
   *
   * @remarks
   * The request is sent to the `/api/collaborative` endpoint of the configured `baseUrl`.
   * It forces a full recalculation by setting `force_recalculate_all` to `true`.
   *
   * @throws Will log an error but not rethrow if the HTTP request fails, to prevent
   * scheduler crashes or blocking other scheduled tasks.
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailyCollaborativeTraining() {
    this.logger.log('Starting daily collaborative filtering training job');
    try {
      const url = `${this.baseUrl}/api/recommend/collaborative`;
      const requestBody = { force_recalculate_all: true };
      const response = await lastValueFrom(
        this.httpService.post(url, requestBody),
      );
      if (response.status === 200) {
        this.logger.log(
          'Successfully completed collaborative filtering training',
        );
      }
    } catch (e) {
      this.logger.error(
        'Failed to complete collaborative filtering training',
        e instanceof Error ? e.stack : null,
      );
    }
  }

  /**
   * Fetches personalized product recommendations based on the user's session and current product.
   *
   * @param sessionId {string} - The unique identifier for the user's session.
   * @param productIds {string[]} - An array of product IDs to generate recommendations.
   * @param topK {number} - The number of top recommendations to retrieve (default is 5).
   * @returns {Promise<Product[]>} A promise that resolves to an array of recommended products.
   */
  async getPersonalizedRecommendations(
    sessionId: string,
    productIds: string[],
    topK: number = 5,
  ): Promise<Product[]> {
    try {
      const url = `${this.baseUrl}/api/recommend/personalize`;
      const requestBody = {
        session_id: sessionId,
        basket_product_ids: productIds,
        top_k: topK,
      };

      const response = await lastValueFrom(
        this.httpService.post(url, requestBody),
      );
      if (response.status !== 200) {
        this.logger.error(
          `Failed to fetch personalized recommendations: ${response.statusText}`,
        );
        return [];
      }

      const responseData = response.data as CollaborativeResponse;
      const recommendedIds = responseData.data.map((r) => r.product_b_id);
      const products = await this.productRepository.findByIds(recommendedIds);
      return recommendedIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => p !== undefined)
        .filter((p) => !p.isDeleted && p.isAvailable);
    } catch (e) {
      this.logger.error(
        'Error fetching personalized recommendations',
        e instanceof Error ? e.stack : null,
      );
      return [];
    }
  }
}
