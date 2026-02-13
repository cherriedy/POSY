import { TableStatus } from '../enums';
import { Floor } from '../../floors/types';
import { Zone } from '../../zones/types';

export class Table {
  constructor(
    public id: string | null,
    public floorId: string | null,
    public zoneId: string | null,
    public name: string,
    public capacity: number,
    public status: TableStatus = TableStatus.AVAILABLE,
    public posX: number | null,
    public posY: number | null,
    public isActive: boolean = true,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    public floor: Floor | null,
    public zone: Zone | null,
  ) {}
}
