import { BaseRepository } from '../../../common/interfaces/base-repository.interface';
import { SessionProductInteraction } from '../entities/session-product-interaction';

export abstract class SessionProductInteractionRepository extends BaseRepository<SessionProductInteraction> {
  abstract bulkUpsert<U = void>(
    entities: SessionProductInteraction[],
  ): Promise<U>;
}
