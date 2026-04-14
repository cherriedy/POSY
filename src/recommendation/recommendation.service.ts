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
import { ProductInteractionService } from '../user-tracking/features/product-interaction.service';

@Injectable()
export class RecommendationService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;
  private readonly baseUrl: string;

  constructor(
    pythonConfigService: PythonConfigService,
    private readonly httpService: HttpService,
    private readonly productRepository: ProductRepository,
    private readonly productInteractionService: ProductInteractionService,
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
  async triggerContentBasedTraining(payload: {
    id?: string;
    forceRecalculateAll?: boolean;
  }) {
    this.logger.log(
      `Received product change event for product ID:) ${payload.id}`,
    );
    const { id, forceRecalculateAll = false } = payload;
    if (!id && !forceRecalculateAll) {
      this.logger.warn(
        'No product ID or forceRecalculateAll flag. Skipping update.',
      );
      return;
    }

    try {
      const url = `${this.baseUrl}/api/recommend/content-based`;
      const requestBody = {
        product_id: id,
        force_recalculate_all: forceRecalculateAll,
      };
      const response = await lastValueFrom(
        this.httpService.post(url, requestBody),
      );
      if (response.status === 200) {
        this.logger.log(
          `Successfully triggered recommendation recalculation for product ID: ${id}`,
        );
      }
    } catch (e) {
      this.logger.error(
        `Failed to trigger recommendation recalculation for product ID: ${id}`,
        e instanceof Error ? e.stack : null,
      );
    }
  }

  /**
   * Manually triggers a full recalculation of the content-based recommendation model.
   */
  async triggerFullContentBasedRecalculation() {
    this.logger.log('Manually triggering full recommendation recalculation');
    await this.triggerContentBasedTraining({
      forceRecalculateAll: true,
    });
  }

  /**
   * Manually triggers a full recalculation of the collaborative filtering model.
   */
  async triggerFullCollaborativeRecalculation() {
    this.logger.log(
      'Manually triggering full collaborative filtering recalculation',
    );
    await this.handleDailyCollaborativeTraining();
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

  /**
   * Schedules a daily full retraining of the collaborative filtering model.
   *
   * Runs every day at 2 AM, sending a request to the external Python recommendation
   * service to retrain the collaborative filtering model with the latest user interactions
   * and product data. This helps maintain and improve recommendation accuracy.
   *
   * @remarks
   * Sends a POST request to the `/api/recommend/collaborative` endpoint of the configured `baseUrl`
   * with `force_recalculate_all` set to `true`.
   *
   * @throws Logs an error if the HTTP request fails, but does not rethrow, ensuring
   * the scheduler continues running other tasks.
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  private async handleDailyCollaborativeTraining() {
    this.logger.log('Starting daily collaborative filtering training job');

    this.logger.log('Synchronizing product interactions before training');
    await this.productInteractionService.syncInteractionToDatabase();
    this.logger.log('Successfully synchronized product interactions');

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
}
