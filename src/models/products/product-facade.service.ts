import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GetProductsService } from './get-products';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductInteractionPayload } from 'src/user-tracking/shared/interfaces/product-interaction-payload';
import { ProductInteractionType } from 'src/user-tracking/shared/enums/product-interaction-type.enum';
import { TableSession } from 'src/models/table-sessions/shared/entities/table-session';
import { Product } from './entities';
import { ProductNotFoundException } from './exceptions';

@Injectable()
export class ProductFacadeService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly getProductsService: GetProductsService,
  ) {}

  /**
   * Fetches detailed information about a product by its unique identifier and emits a view
   * interaction event. Emits an event to track that the product was viewed in the context
   * of the provided table session.
   *
   * @param id {string} - The unique identifier of the product to fetch.
   * @param session {TableSession} The current table session.
   * @returns A promise that resolves to the fetched {@link Product} instance.
   * @throws ProductNotFoundException if the product is deleted or unavailable.
   */
  async getProductDetailWithViewEvent(
    id: string,
    session: TableSession,
  ): Promise<Product> {
    const product = await this.getProductsService.getById(id, {
      attributes: true,
    });
    if (product.isDeleted || !product.isAvailable) {
      throw new ProductNotFoundException(id);
    }

    try {
      // No fallback header-based session used: only use the TableSession

      const payload: ProductInteractionPayload = {
        sessionId: session.id!,
        productId: product.id!,
        type: ProductInteractionType.VIEW,
        timestamp: new Date().toISOString(),
      };

      // Emit a product view interaction event; consumed by user-tracking listeners on 'interaction.product.*'
      try {
        this.eventEmitter.emit(
          `interaction.product.${ProductInteractionType.VIEW}`,
          payload,
        );
      } catch (e) {
        this.logger.error('Failed to emit product VIEW interaction', e);
      }
    } catch (e) {
      this.logger.error('Failed to process product VIEW interaction', e);
    }

    return product;
  }
}
