import { Table } from '../../tables/types';

export class Zone {
  constructor(
    public id: string | null,
    public name: string,
    public description: string | null,
    public isActive: boolean,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    public tables: Table[] | null,
  ) {}
}
