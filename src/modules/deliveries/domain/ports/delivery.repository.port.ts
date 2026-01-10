import { Result } from '../../../../shared/domain/result';
import { Delivery } from '../entities/delivery.entity';

export const DELIVERY_REPOSITORY = Symbol('DELIVERY_REPOSITORY');

export interface IDeliveryRepository {
  create(delivery: Delivery): Promise<Result<Delivery, Error>>;
  findById(id: string): Promise<Result<Delivery, Error>>;
  findByTransactionId(transactionId: string): Promise<Result<Delivery, Error>>;
  update(delivery: Delivery): Promise<Result<Delivery, Error>>;
}
