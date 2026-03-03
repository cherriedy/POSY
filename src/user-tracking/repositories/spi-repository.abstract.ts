import { BaseRepository } from '../../common/interfaces';
import { SessionProductInteraction } from '../entities';

export abstract class SessionProductInteractionRepository extends BaseRepository<SessionProductInteraction> {
  abstract bulkUpsert(entities: SessionProductInteraction[]): Promise<void>;
}
