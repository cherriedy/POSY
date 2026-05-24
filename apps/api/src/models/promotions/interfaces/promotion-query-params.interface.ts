import { PaginationParams } from '@posy/shared';
import { PromotionApplicability } from '../enums/promotion-applicability.enum';
import { PromotionDiscountType } from '../enums/promotion-discount-type.enum';
import { PromotionStatus } from '../enums/promotion-status.enum';

export interface PromotionQueryFilters {
  /** Blind search query for code, title, or description */
  query?: string;
  productId?: string;
  categoryId?: string;
  discountType?: PromotionDiscountType[];
  applicability?: PromotionApplicability[];
  status?: PromotionStatus[];
  isStackable?: boolean;
  priorityMin?: number;
  priorityMax?: number;
  isDeleted?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface PromotionQueryParams extends PaginationParams {
  filter?: PromotionQueryFilters;
}
