import { TableSessionStatus } from '../enums';
import { Table } from '../../tables/types';

export class TableSession {
  constructor(
    public id: string | null,
    public tableId: string,
    public createdBy: string | null,
    public sessionToken: string,
    public deviceFingerprint: string,
    public status: TableSessionStatus,
    public startAt: Date,
    public endAt: Date | null,
    public expiresAt: Date,
    public table: Table | null,
  ) {}
}
