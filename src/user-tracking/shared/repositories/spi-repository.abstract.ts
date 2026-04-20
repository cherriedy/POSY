import { BaseRepository } from '../../../common/interfaces';
import { SessionProductInteraction } from '../entities';

export abstract class SessionProductInteractionRepository extends BaseRepository<SessionProductInteraction> {
  abstract bulkUpsert<U = void>(
    entities: SessionProductInteraction[],
  ): Promise<U>;
}
