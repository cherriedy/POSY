import { BaseRepository, Page } from '../../../../common/interfaces';
import { PaymentMethod } from '../entities';
import { PaymentMethodQueryParams } from '../interfaces';

export abstract class PaymentMethodRepository implements BaseRepository<PaymentMethod> {
  abstract getAllPaged(
    params: PaymentMethodQueryParams,
  ): Promise<Page<PaymentMethod>>;

  abstract toggle(id: string): Promise<PaymentMethod>;
}
