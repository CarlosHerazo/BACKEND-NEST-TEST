import { Result } from '../../../../shared/domain/result';
import { Transaction } from '../entities/transaction.entity';

export interface ITransactionRepository {
  create(transaction: Transaction): Promise<Result<Transaction, Error>>;
  findById(id: string): Promise<Result<Transaction, Error>>;
  findByReference(reference: string): Promise<Result<Transaction, Error>>;
  findAll(): Promise<Result<Transaction[], Error>>;
  findByCustomerId(customerId: string): Promise<Result<Transaction[], Error>>;
  update(transaction: Transaction): Promise<Result<Transaction, Error>>;
  existsById(id: string): Promise<Result<boolean, Error>>;
}

export const TRANSACTION_REPOSITORY = Symbol('ITransactionRepository');
