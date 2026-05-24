import { BaseRepository } from '@posy/shared';
import { SessionProductInteraction } from '../entities/session-product-interaction';

export abstract class SessionProductInteractionRepository extends BaseRepository<SessionProductInteraction> {
  abstract bulkUpsert<U = void>(
    entities: SessionProductInteraction[],
  ): Promise<U>;
}
