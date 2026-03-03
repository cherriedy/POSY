import { Zone } from 'src/models/zones/types';

export class Floor {
  constructor(
    public id: string | null,
    public name: string,
    public order: number,
    public isActive: boolean,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    public zones: Zone[] | null
  ) {}
}
