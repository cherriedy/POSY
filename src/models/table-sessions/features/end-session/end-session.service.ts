import { Injectable } from '@nestjs/common';
import { TableSessionRepository } from '../../shared/repositories';
import { TableSessionNotFoundException } from '../../shared/exceptions/table-session-not-found.exception';

@Injectable()
export class EndSessionService {
  constructor(
    private readonly tableSessionRepository: TableSessionRepository,
  ) {}

  async execute(sessionToken: string): Promise<void> {
    const session = await this.tableSessionRepository.findByToken(sessionToken);
    if (!session) throw new TableSessionNotFoundException();
    await this.tableSessionRepository.endSession(session.id!);
  }
}
