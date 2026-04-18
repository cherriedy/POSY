import { TableSession } from '../../../models/table-sessions';
import { Product } from '../../../models/products';

export class SessionProductInteraction {
  constructor(
    public id: string | null = null,
    public sessionId: string,
    public productId: string,
    public viewCount: number = 0,
    public orderCount: number = 0,
    public totalQuantity: number = 0,
    public totalSpent: number = 0,
    public createdAt: Date | null = null,
    public updatedAt: Date | null = null,
    // Relations
    public product: Product | null = null,
    public tableSession: TableSession | null = null,
  ) {}
}
