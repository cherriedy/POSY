import { Promotion } from './promotion.class';
import { Category } from '../../categories/types';
import { Floor } from 'src/models/floors/types';
import { Zone } from 'src/models/zones/types';

export class PromotionCategory {
  constructor(
    public readonly id: string | null,
    public readonly promotionId: string,
    public readonly categoryId: string,
    public readonly floorId?: string | null,
    public readonly zoneId?: string | null,
    public readonly promotion?: Promotion,
    public readonly category?: Category,
    public readonly floor?: Floor,
    public readonly zone?: Zone,
  ) {}
}