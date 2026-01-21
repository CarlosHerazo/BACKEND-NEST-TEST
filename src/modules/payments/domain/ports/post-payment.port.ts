import { Transaction } from '../../../transactions/domain/entities/transaction.entity';

export interface ProductItem {
  productId: string;
  quantity: number;
}

export interface IPostPaymentPort {
  handle(transaction: Transaction, products: ProductItem[]): Promise<void>;
}

export const POST_PAYMENT_PORT = Symbol('POST_PAYMENT_PORT');
