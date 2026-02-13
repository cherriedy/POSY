import { Table } from '../../tables/types';

export class Floor {
  constructor(
    public id: string | null,
    public name: string,
    public order: number,
    public isActive: boolean,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    public tables: Table[] | null,
  ) {}
}
