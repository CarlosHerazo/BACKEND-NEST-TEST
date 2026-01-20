import { Result } from '../../../../shared/domain/result';
import { DiscountCode } from '../entities/discount-code.entity';

export interface IDiscountCodeRepository {
  create(discountCode: DiscountCode): Promise<Result<DiscountCode, Error>>;
  findById(id: string): Promise<Result<DiscountCode, Error>>;
  findByCode(code: string): Promise<Result<DiscountCode, Error>>;
  findAll(): Promise<Result<DiscountCode[], Error>>;
  update(discountCode: DiscountCode): Promise<Result<DiscountCode, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
}
